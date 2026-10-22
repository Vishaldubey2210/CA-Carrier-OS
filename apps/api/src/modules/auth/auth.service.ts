import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
  Optional,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { WorkspaceService } from '../workspace/workspace.service.js';
import {
  RegisterRequest,
  RegisterRequestSchema,
  LoginRequest,
  LoginRequestSchema,
  RefreshTokenRequest,
  RefreshTokenRequestSchema,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponseData,
  UserRole,
  WorkspaceType,
  MemberRole,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  signJwt,
} from '../../common/security/crypto.util.js';
import { globalAuthRateLimiter } from '../../common/security/rate-limiter.js';
import { env } from '../../common/config/env.config.js';

interface InMemoryUser {
  id: string;
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  personalWorkspaceId: string;
}

interface InMemoryToken {
  tokenHash: string;
  userId: string;
  familyId: string;
  revoked: boolean;
  expiresAt: Date;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // In-memory fallback stores when DB is offline
  private readonly memUsers = new Map<string, InMemoryUser>();
  private readonly memTokens = new Map<string, InMemoryToken>();
  private readonly memResetTokens = new Map<string, { userId: string; expiresAt: Date }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceService: WorkspaceService
  ) {}

  /**
   * Register a new user and provision workspaces
   */
  async register(rawInput: RegisterRequest): Promise<AuthResponseData> {
    const input = RegisterRequestSchema.parse(rawInput);
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check if user already exists
    if (this.prisma.isDatabaseConnected()) {
      const existing = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (existing) {
        throw new ConflictException('User with this email already exists');
      }
    } else {
      if (this.memUsers.has(normalizedEmail)) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const hashedPassword = await hashPassword(input.password);
    const userId = randomUUID();
    const personalWorkspaceId = randomUUID();

    // Mandatory personal workspace provisioning for every registered user
    this.workspaceService.createPersonalWorkspace(userId, input.firstName, personalWorkspaceId);

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.$transaction(async (tx) => {
        // 1. Create User
        await tx.user.create({
          data: {
            id: userId,
            email: normalizedEmail,
            hashedPassword,
            firstName: input.firstName,
            lastName: input.lastName,
            role: input.role,
          },
        });

        // 2. Provision Personal Workspace
        await tx.workspace.create({
          data: {
            id: personalWorkspaceId,
            name: `${input.firstName}'s Personal Workspace`,
            slug: `personal-${userId.slice(0, 8)}`,
            type: WorkspaceType.PERSONAL,
            ownerId: userId,
            memberships: {
              create: {
                userId,
                memberRole: MemberRole.OWNER,
                isDefault: true,
              },
            },
          },
        });

        // 3. If Recruiter / Org Admin, also provision Organization Workspace
        if (input.role === UserRole.RECRUITER || input.role === UserRole.ORG_ADMIN) {
          const orgId = randomUUID();
          await tx.workspace.create({
            data: {
              id: orgId,
              name: input.organizationName || `${input.firstName}'s Firm`,
              slug: `org-${userId.slice(0, 8)}`,
              type: WorkspaceType.ORGANIZATION,
              ownerId: userId,
              memberships: {
                create: {
                  userId,
                  memberRole: MemberRole.OWNER,
                  isDefault: false,
                },
              },
            },
          });
        }

        // 4. Audit Log
        await tx.auditEvent.create({
          data: {
            actorId: userId,
            workspaceId: personalWorkspaceId,
            operation: 'USER_REGISTERED',
            resourceType: 'User',
            resourceId: userId,
            outcome: 'SUCCESS',
            correlationId: randomUUID(),
            payloadSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            durationMs: 0,
          },
        });
      });
    } else {
      // Offline fallback
      this.memUsers.set(normalizedEmail, {
        id: userId,
        email: normalizedEmail,
        hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        personalWorkspaceId,
      });
    }

    // Generate tokens
    return await this.issueTokens({
      id: userId,
      email: normalizedEmail,
      firstName: input.firstName,
      lastName: input.lastName,
      role: input.role,
    }, personalWorkspaceId);
  }

  /**
   * Authenticate user credentials and issue tokens
   */
  async login(rawInput: LoginRequest, clientIp = '127.0.0.1'): Promise<AuthResponseData> {
    const input = LoginRequestSchema.parse(rawInput);
    const normalizedEmail = input.email.toLowerCase().trim();
    const rateLimitKey = `${clientIp}:${normalizedEmail}`;

    // Rate limiting check
    globalAuthRateLimiter.checkRateLimit(rateLimitKey);

    let user: {
      id: string;
      email: string;
      hashedPassword: string;
      firstName: string;
      lastName: string;
      role: UserRole;
    } | null = null;
    let defaultWorkspaceId: string | null = null;

    if (this.prisma.isDatabaseConnected()) {
      const dbUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
          memberships: {
            where: { isDefault: true },
            include: { workspace: true },
          },
        },
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          hashedPassword: dbUser.hashedPassword,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          role: dbUser.role as unknown as UserRole,
        };
        defaultWorkspaceId = dbUser.memberships[0]?.workspaceId || null;
      }
    } else {
      const memUser = this.memUsers.get(normalizedEmail);
      if (memUser) {
        user = memUser;
        defaultWorkspaceId = memUser.personalWorkspaceId;
      }
    }

    if (!user) {
      globalAuthRateLimiter.recordFailure(rateLimitKey);
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValidPassword = await verifyPassword(input.password, user.hashedPassword);
    if (!isValidPassword) {
      globalAuthRateLimiter.recordFailure(rateLimitKey);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Reset rate limiter on successful login
    globalAuthRateLimiter.reset(rateLimitKey);

    // If default workspace not found, find first personal workspace
    if (!defaultWorkspaceId) {
      if (this.prisma.isDatabaseConnected()) {
        const anyMembership = await this.prisma.workspaceMembership.findFirst({
          where: { userId: user.id },
        });
        defaultWorkspaceId = anyMembership?.workspaceId || randomUUID();
      } else {
        defaultWorkspaceId = randomUUID();
      }
    }

    return await this.issueTokens(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      defaultWorkspaceId
    );
  }

  /**
   * Refresh session and rotate tokens with reuse detection
   */
  async refreshToken(rawInput: RefreshTokenRequest): Promise<AuthResponseData> {
    const input = RefreshTokenRequestSchema.parse(rawInput);
    const tokenHash = hashToken(input.refreshToken);

    let tokenRecord: {
      userId: string;
      familyId: string;
      revoked: boolean;
      expiresAt: Date;
    } | null = null;

    if (this.prisma.isDatabaseConnected()) {
      tokenRecord = await this.prisma.refreshToken.findUnique({
        where: { tokenHash },
      });
    } else {
      tokenRecord = this.memTokens.get(tokenHash) || null;
    }

    if (!tokenRecord) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Reuse detection: If token was already revoked, someone is replaying it!
    // Revoke all tokens in family immediately for security.
    if (tokenRecord.revoked) {
      this.logger.warn(`Refresh token reuse detected for family ${tokenRecord.familyId}! Revoking family.`);
      if (this.prisma.isDatabaseConnected()) {
        await this.prisma.refreshToken.updateMany({
          where: { familyId: tokenRecord.familyId },
          data: { revoked: true },
        });
      } else {
        for (const [k, v] of this.memTokens.entries()) {
          if (v.familyId === tokenRecord.familyId) {
            v.revoked = true;
          }
        }
      }
      throw new UnauthorizedException('Token reuse detected. All sessions revoked for security.');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new UnauthorizedException('Refresh token has expired');
    }

    // Invalidate current token
    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.refreshToken.update({
        where: { tokenHash },
        data: { revoked: true },
      });
    } else {
      tokenRecord.revoked = true;
    }

    // Fetch user details
    let user: InMemoryUser | null = null;
    let defaultWorkspaceId: string = randomUUID();

    if (this.prisma.isDatabaseConnected()) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: tokenRecord.userId },
        include: { memberships: { where: { isDefault: true } } },
      });
      if (dbUser) {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          hashedPassword: dbUser.hashedPassword,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          role: dbUser.role as unknown as UserRole,
          personalWorkspaceId: String(dbUser.memberships[0]?.workspaceId || randomUUID()),
        };
        defaultWorkspaceId = String(user.personalWorkspaceId);
      }
    } else {
      for (const u of this.memUsers.values()) {
        if (u.id === tokenRecord.userId) {
          user = u;
          defaultWorkspaceId = String(u.personalWorkspaceId);
          break;
        }
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Issue new pair with same family ID
    return await this.issueTokens(
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      defaultWorkspaceId,
      tokenRecord.familyId
    );
  }

  /**
   * Invalidate refresh token on logout
   */
  async logout(refreshToken: string, userId?: string): Promise<{ success: true }> {
    if (!refreshToken) return { success: true };
    const tokenHash = hashToken(refreshToken);

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revoked: true },
      });
      if (userId) {
        await this.prisma.auditEvent.create({
          data: {
            actorId: userId,
            workspaceId: randomUUID(),
            operation: 'USER_LOGOUT',
            resourceType: 'Session',
            resourceId: tokenHash,
            outcome: 'SUCCESS',
            correlationId: randomUUID(),
            payloadSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            durationMs: 0,
          },
        }).catch(() => {});
      }
    } else {
      const record = this.memTokens.get(tokenHash);
      if (record) {
        record.revoked = true;
      }
    }

    return { success: true };
  }

  /**
   * Request password reset token
   */
  async forgotPassword(input: ForgotPasswordRequest): Promise<{ message: string; resetToken?: string }> {
    const normalizedEmail = input.email.toLowerCase().trim();
    const token = generateSecureToken(24);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    let userId: string | null = null;
    if (this.prisma.isDatabaseConnected()) {
      const user = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
      });
      if (user) userId = user.id;
    } else {
      const user = this.memUsers.get(normalizedEmail);
      if (user) userId = user.id;
    }

    if (userId) {
      this.memResetTokens.set(token, { userId, expiresAt });
    }

    // Always return success to prevent email enumeration
    return {
      message: 'If an account exists with this email, password reset instructions have been generated.',
      ...(process.env.NODE_ENV !== 'production' ? { resetToken: token } : {}),
    };
  }

  /**
   * Reset password with valid token
   */
  async resetPassword(input: ResetPasswordRequest): Promise<{ success: true }> {
    const record = this.memResetTokens.get(input.token);
    if (!record || new Date() > record.expiresAt) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newHashedPassword = await hashPassword(input.newPassword);

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.user.update({
        where: { id: record.userId },
        data: { hashedPassword: newHashedPassword },
      });
      // Revoke all existing sessions
      await this.prisma.refreshToken.updateMany({
        where: { userId: record.userId },
        data: { revoked: true },
      });
    } else {
      for (const u of this.memUsers.values()) {
        if (u.id === record.userId) {
          u.hashedPassword = newHashedPassword;
          break;
        }
      }
    }

    this.memResetTokens.delete(input.token);
    return { success: true };
  }

  /**
   * Get current authenticated user profile and workspaces
   */
  async getMe(userId: string) {
    if (this.prisma.isDatabaseConnected()) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          memberships: {
            include: { workspace: true },
          },
        },
      });
      if (!user) {
        throw new NotFoundException('User profile not found');
      }
      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as unknown as UserRole,
        workspaces: user.memberships.map((m) => ({
          id: m.workspace.id,
          name: m.workspace.name,
          slug: m.workspace.slug,
          type: m.workspace.type as unknown as WorkspaceType,
          role: m.memberRole as unknown as MemberRole,
          isDefault: m.isDefault,
        })),
      };
    } else {
      for (const u of this.memUsers.values()) {
        if (u.id === userId) {
          return {
            id: u.id,
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            role: u.role,
            workspaces: [
              {
                id: u.personalWorkspaceId,
                name: `${u.firstName}'s Personal Workspace`,
                slug: `personal-${u.id.slice(0, 8)}`,
                type: WorkspaceType.PERSONAL,
                role: MemberRole.OWNER,
                isDefault: true,
              },
            ],
          };
        }
      }
      throw new NotFoundException('User profile not found');
    }
  }

  /**
   * Internal helper to issue access + refresh token pair
   */
  private async issueTokens(
    user: { id: string; email: string; firstName: string; lastName: string; role: UserRole },
    defaultWorkspaceId: string,
    existingFamilyId?: string
  ): Promise<AuthResponseData> {
    const expiresIn = 900; // 15 minutes
    const accessToken = signJwt(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        workspaceId: defaultWorkspaceId,
      },
      env.JWT_SECRET,
      expiresIn
    );

    const refreshToken = generateSecureToken(32);
    const tokenHash = hashToken(refreshToken);
    const familyId = existingFamilyId || randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.refreshToken.create({
        data: {
          userId: user.id,
          tokenHash,
          familyId,
          expiresAt,
        },
      });
    } else {
      this.memTokens.set(tokenHash, {
        tokenHash,
        userId: user.id,
        familyId,
        revoked: false,
        expiresAt,
      });
    }

    return {
      accessToken,
      refreshToken,
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      defaultWorkspaceId,
    };
  }
}
