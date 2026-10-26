import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
  Logger,
  Optional,
  HttpException,
  HttpStatus,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { WorkspaceService } from '../workspace/workspace.service.js';
import {
  RegisterRequest,
  RegisterRequestSchema,
  LoginRequest,
  LoginRequestSchema,
  VerifyOtpRequest,
  VerifyOtpRequestSchema,
  ResendOtpRequest,
  ResendOtpRequestSchema,
  VerifyEmailRequest,
  VerifyEmailRequestSchema,
  ResendVerificationRequest,
  ResendVerificationRequestSchema,
  RefreshTokenRequest,
  RefreshTokenRequestSchema,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  AuthResponseData,
  LoginOtpChallengeResponse,
  UserRole,
  WorkspaceType,
  MemberRole,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { EmailService } from '../email/email.service.js';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  signJwt,
} from '../../common/security/crypto.util.js';
import { globalAuthRateLimiter } from '../../common/security/rate-limiter.js';
import { env } from '../../common/config/env.config.js';
import crypto from 'node:crypto';

interface InMemoryUser {
  id: string;
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  emailVerified: boolean;
  personalWorkspaceId: string;
}

interface InMemoryChallenge {
  id: string;
  userId: string;
  purpose: string;
  codeHash: string;
  salt: string;
  otpCode: string; // Stored only in test mock store for assertions
  attempts: number;
  maxAttempts: number;
  expiresAt: Date;
  resendAfter: Date;
  verifiedAt: Date | null;
  clientIp?: string;
  createdAt: Date;
}

interface InMemoryEmailVerification {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
}

interface InMemoryToken {
  tokenHash: string;
  userId: string;
  familyId: string;
  revoked: boolean;
  expiresAt: Date;
}

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  // In-memory fallback stores when DB is offline
  private readonly memUsers = new Map<string, InMemoryUser>();
  private readonly memTokens = new Map<string, InMemoryToken>();
  private readonly memResetTokens = new Map<string, { userId: string; expiresAt: Date }>();
  private readonly memChallenges = new Map<string, InMemoryChallenge>();
  private readonly memEmailTokens = new Map<string, InMemoryEmailVerification>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly workspaceService: WorkspaceService,
    @Optional() private readonly emailService: EmailService = new EmailService()
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedDemoUsers();
  }

  public async seedDemoUsers(): Promise<void> {
    const demoHashedPassword = await hashPassword('DemoPassword123!');
    const demoUsers = [
      {
        id: '00000000-0000-0000-0000-0000000000c1',
        email: 'candidate.priya@cacareeros.com',
        firstName: 'Priya',
        lastName: 'Sharma (CA)',
        role: UserRole.CANDIDATE,
        workspaceId: '00000000-0000-0000-0000-0000000001w1',
        workspaceName: "Priya's Personal Workspace",
      },
      {
        id: '00000000-0000-0000-0000-0000000000r1',
        email: 'recruiter.vikram@deloitte-partner.com',
        firstName: 'Vikram',
        lastName: 'Mehta (Partner)',
        role: UserRole.RECRUITER,
        workspaceId: '00000000-0000-0000-0000-0000000001w2',
        workspaceName: 'Deloitte Advisory & Audit Workspace',
      },
      {
        id: '00000000-0000-0000-0000-0000000000a1',
        email: 'admin@cacareeros.com',
        firstName: 'Rajesh',
        lastName: 'Gupta (Admin)',
        role: UserRole.PLATFORM_ADMIN,
        workspaceId: '00000000-0000-0000-0000-0000000001w3',
        workspaceName: 'CA Career OS Admin Portal',
      },
    ];

    for (const d of demoUsers) {
      this.memUsers.set(d.email, {
        id: d.id,
        email: d.email,
        hashedPassword: demoHashedPassword,
        firstName: d.firstName,
        lastName: d.lastName,
        role: d.role,
        personalWorkspaceId: d.workspaceId,
        emailVerified: true,
      });

      this.workspaceService.createPersonalWorkspace(d.id, d.firstName, d.workspaceId);

      if (this.prisma && this.prisma.isDatabaseConnected()) {
        try {
          await this.prisma.user.upsert({
            where: { email: d.email },
            create: {
              id: d.id,
              email: d.email,
              hashedPassword: demoHashedPassword,
              firstName: d.firstName,
              lastName: d.lastName,
              role: d.role as any,
              emailVerified: true,
            },
            update: {
              role: d.role as any,
              firstName: d.firstName,
              lastName: d.lastName,
            },
          });
        } catch (err: any) {
          // Non-critical in test/offline runs
        }
      }
    }
  }

  /**
   * 1-Click Instant Demo Login (Candidate, Recruiter, Admin)
   */
  async demoLogin(roleParam = 'CANDIDATE'): Promise<AuthResponseData> {
    await this.seedDemoUsers();
    const roleUpper = (roleParam || '').toUpperCase();

    let targetEmail = 'candidate.priya@cacareeros.com';
    let defaultWorkspaceId = '00000000-0000-0000-0000-0000000001w1';

    if (roleUpper.includes('RECRUIT') || roleUpper.includes('EMPLOYER')) {
      targetEmail = 'recruiter.vikram@deloitte-partner.com';
      defaultWorkspaceId = '00000000-0000-0000-0000-0000000001w2';
    } else if (roleUpper.includes('ADMIN') || roleUpper.includes('PLATFORM') || roleUpper.includes('ORG')) {
      targetEmail = 'admin@cacareeros.com';
      defaultWorkspaceId = '00000000-0000-0000-0000-0000000001w3';
    }

    const memUser = this.memUsers.get(targetEmail);
    if (!memUser) {
      throw new NotFoundException(`Demo user for role ${roleParam} not found.`);
    }

    return await this.issueTokens(
      {
        id: memUser.id,
        email: memUser.email,
        firstName: memUser.firstName,
        lastName: memUser.lastName,
        role: memUser.role,
      },
      defaultWorkspaceId,
      undefined,
      30 * 24 * 3600 // 30 days for demo sessions
    );
  }

  public getEmailService(): EmailService {
    return this.emailService;
  }

  /**
   * Helper to inspect the latest OTP code in tests
   */
  public getLatestOtpForTesting(email: string): string | undefined {
    const user = this.findUserByEmail(email);
    if (!user) return undefined;
    const challenge = [...this.memChallenges.values()]
      .reverse()
      .find((c) => c.userId === user.id && !c.verifiedAt);
    return challenge?.otpCode;
  }

  private findUserByEmail(email: string): { id: string; email: string } | null {
    const norm = email.toLowerCase().trim();
    const mem = this.memUsers.get(norm);
    if (mem) return { id: mem.id, email: mem.email };
    return null;
  }

  private maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    if (!domain) return '***@***.com';
    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }
    return `${local[0]}***${local[local.length - 1]}@${domain}`;
  }

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
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Registration is unavailable. Database connection required in production.');
      }
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
        emailVerified: false,
        personalWorkspaceId,
      });
    }

    // Generate email verification token on registration
    const verificationToken = generateSecureToken(32);
    const tokenHash = hashToken(verificationToken);
    const appUrl = process.env.APP_URL || process.env.PUBLIC_APP_ORIGIN || 'http://localhost:3000';
    const verificationLink = `${appUrl}/verify-email?token=${verificationToken}`;

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.emailVerificationToken.create({
        data: {
          id: randomUUID(),
          tokenHash,
          userId,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      }).catch((err) => this.logger.warn(`Failed to persist email verification token: ${err.message}`));
    } else {
      this.memEmailTokens.set(tokenHash, {
        tokenHash,
        userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        usedAt: null,
      });
    }

    try {
      await this.emailService.sendEmailVerification(normalizedEmail, verificationLink, input.firstName);
    } catch (err: any) {
      this.logger.warn(`Failed to dispatch registration verification email: ${err.message}`);
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
   * Authenticate user credentials and issue OTP challenge
   * Never issues JWT or refresh token before OTP verification succeeds.
   */
  async login(rawInput: LoginRequest, clientIp = '127.0.0.1'): Promise<LoginOtpChallengeResponse> {
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

    if (this.prisma.isDatabaseConnected()) {
      const dbUser = await this.prisma.user.findUnique({
        where: { email: normalizedEmail },
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
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Authentication is unavailable. Database connection required in production.');
      }
      const memUser = this.memUsers.get(normalizedEmail);
      if (memUser) {
        user = memUser;
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

    // Reset rate limiter on successful password verification
    globalAuthRateLimiter.reset(rateLimitKey);

    // Cryptographically secure 6-digit OTP generation
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString('hex');
    const codeHash = crypto.createHmac('sha256', env.JWT_SECRET + salt).update(otpCode).digest('hex');
    const challengeId = randomUUID();
    const now = new Date();
    const expiresInSeconds = 300; // 5 minutes
    const resendCooldownSeconds = 60; // 60 seconds
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);
    const resendAfter = new Date(now.getTime() + resendCooldownSeconds * 1000);

    // Invalidate existing pending challenges for this user
    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.authChallenge.updateMany({
        where: { userId: user.id, verifiedAt: null },
        data: { expiresAt: now },
      }).catch(() => {});
    } else {
      for (const c of this.memChallenges.values()) {
        if (c.userId === user.id && !c.verifiedAt) {
          c.expiresAt = now;
        }
      }
    }

    // Persist new challenge
    if (this.prisma.isDatabaseConnected()) {
      try {
        await this.prisma.authChallenge.create({
          data: {
            id: challengeId,
            userId: user.id,
            purpose: 'LOGIN_OTP',
            codeHash,
            salt,
            attempts: 0,
            maxAttempts: 5,
            expiresAt,
            resendAfter,
            clientIp,
          },
        });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new ServiceUnavailableException('Authentication challenge storage failed. Persistent database unavailable.');
        }
        this.logger.warn(`Failed to persist challenge to DB, fallback to memory: ${err.message}`);
      }
    }

    this.memChallenges.set(challengeId, {
      id: challengeId,
      userId: user.id,
      purpose: 'LOGIN_OTP',
      codeHash,
      salt,
      otpCode,
      attempts: 0,
      maxAttempts: 5,
      expiresAt,
      resendAfter,
      verifiedAt: null,
      clientIp,
      createdAt: now,
    });

    // Send OTP via SMTP
    try {
      await this.emailService.sendLoginOtp(user.email, otpCode, user.firstName);
    } catch (err: any) {
      // Invalidate unusable challenge on delivery failure
      if (this.prisma.isDatabaseConnected()) {
        await this.prisma.authChallenge.delete({ where: { id: challengeId } }).catch(() => {});
      }
      this.memChallenges.delete(challengeId);
      this.logger.error(`Failed to dispatch authentication OTP: ${err.message}`);
      throw new ServiceUnavailableException('Failed to dispatch verification email. Please check your network or try again.');
    }

    return {
      requiresOtp: true,
      challengeId,
      maskedEmail: this.maskEmail(user.email),
      expiresInSeconds,
      resendCooldownSeconds,
    };
  }

  /**
   * Verify OTP and issue authenticated session tokens
   */
  async verifyOtp(rawInput: VerifyOtpRequest, clientIp = '127.0.0.1'): Promise<AuthResponseData> {
    const input = VerifyOtpRequestSchema.parse(rawInput);
    const now = new Date();

    let challenge: {
      id: string;
      userId: string;
      codeHash: string;
      salt: string;
      attempts: number;
      maxAttempts: number;
      expiresAt: Date;
      verifiedAt: Date | null;
    } | null = null;

    if (this.prisma.isDatabaseConnected()) {
      challenge = await this.prisma.authChallenge.findUnique({
        where: { id: input.challengeId },
      });
    } else {
      challenge = this.memChallenges.get(input.challengeId) || null;
    }

    if (!challenge) {
      throw new UnauthorizedException('Invalid or expired authentication challenge. Please sign in again.');
    }

    if (challenge.verifiedAt !== null) {
      throw new UnauthorizedException('This authentication code has already been used.');
    }

    if (now > challenge.expiresAt) {
      throw new UnauthorizedException('Verification code has expired. Please initiate a new sign-in.');
    }

    if (challenge.attempts >= challenge.maxAttempts) {
      throw new UnauthorizedException('Maximum verification attempts exceeded. Please initiate a new sign-in.');
    }

    // Constant-time HMAC comparison
    const expectedHash = crypto.createHmac('sha256', env.JWT_SECRET + challenge.salt).update(input.code).digest('hex');
    const expectedBuf = Buffer.from(expectedHash, 'hex');
    const actualBuf = Buffer.from(challenge.codeHash, 'hex');
    const isMatch = expectedBuf.length === actualBuf.length && crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!isMatch) {
      const newAttempts = challenge.attempts + 1;
      if (this.prisma.isDatabaseConnected()) {
        await this.prisma.authChallenge.update({
          where: { id: challenge.id },
          data: { attempts: newAttempts },
        }).catch(() => {});
      }
      const memC = this.memChallenges.get(challenge.id);
      if (memC) memC.attempts = newAttempts;

      const remaining = Math.max(0, challenge.maxAttempts - newAttempts);
      if (remaining === 0) {
        throw new UnauthorizedException('Maximum verification attempts exceeded. Please initiate a new sign-in.');
      }
      throw new UnauthorizedException(`Invalid verification code. ${remaining} attempt(s) remaining.`);
    }

    // Success: mark challenge as verified
    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.authChallenge.update({
        where: { id: challenge.id },
        data: { verifiedAt: now },
      });
    }
    const memC = this.memChallenges.get(challenge.id);
    if (memC) memC.verifiedAt = now;

    // Retrieve user and provision default workspace
    let user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
    } | null = null;
    let defaultWorkspaceId: string | null = null;

    if (this.prisma.isDatabaseConnected()) {
      const dbUser = await this.prisma.user.findUnique({
        where: { id: challenge.userId },
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
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          role: dbUser.role as unknown as UserRole,
        };
        defaultWorkspaceId = dbUser.memberships[0]?.workspaceId || null;
      }
    } else {
      for (const u of this.memUsers.values()) {
        if (u.id === challenge.userId) {
          user = u;
          defaultWorkspaceId = u.personalWorkspaceId;
          break;
        }
      }
    }

    if (!user) {
      throw new UnauthorizedException('User account associated with this challenge no longer exists.');
    }

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
   * Resend login OTP code with cooldown enforcement
   */
  async resendOtp(rawInput: ResendOtpRequest, clientIp = '127.0.0.1'): Promise<{
    success: true;
    message: string;
    expiresInSeconds: number;
    resendCooldownSeconds: number;
  }> {
    const input = ResendOtpRequestSchema.parse(rawInput);
    const now = new Date();

    let challenge: any = null;
    if (this.prisma.isDatabaseConnected()) {
      challenge = await this.prisma.authChallenge.findUnique({
        where: { id: input.challengeId },
        include: { user: true },
      });
    } else {
      challenge = this.memChallenges.get(input.challengeId) || null;
    }

    if (!challenge || challenge.verifiedAt !== null) {
      throw new UnauthorizedException('Invalid or expired authentication challenge.');
    }

    if (now < challenge.resendAfter) {
      const waitSeconds = Math.ceil((challenge.resendAfter.getTime() - now.getTime()) / 1000);
      throw new HttpException(
        `Please wait ${waitSeconds} seconds before requesting a new code.`,
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    let userEmail = challenge.user?.email;
    let userFirstName = challenge.user?.firstName;

    if (!userEmail) {
      const memU = [...this.memUsers.values()].find((u) => u.id === challenge.userId);
      userEmail = memU?.email;
      userFirstName = memU?.firstName;
    }

    if (!userEmail) {
      throw new UnauthorizedException('User account no longer found.');
    }

    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const salt = crypto.randomBytes(16).toString('hex');
    const codeHash = crypto.createHmac('sha256', env.JWT_SECRET + salt).update(otpCode).digest('hex');
    const expiresInSeconds = 300;
    const resendCooldownSeconds = 60;
    const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);
    const resendAfter = new Date(now.getTime() + resendCooldownSeconds * 1000);

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.authChallenge.update({
        where: { id: challenge.id },
        data: {
          codeHash,
          salt,
          attempts: 0,
          expiresAt,
          resendAfter,
        },
      });
    }

    const memC = this.memChallenges.get(challenge.id);
    if (memC) {
      memC.codeHash = codeHash;
      memC.salt = salt;
      memC.otpCode = otpCode;
      memC.attempts = 0;
      memC.expiresAt = expiresAt;
      memC.resendAfter = resendAfter;
    }

    await this.emailService.sendLoginOtp(userEmail, otpCode, userFirstName);

    return {
      success: true,
      message: 'A fresh verification code has been dispatched to your email address.',
      expiresInSeconds,
      resendCooldownSeconds,
    };
  }

  /**
   * Verify email address on registration
   */
  async verifyEmail(rawInput: VerifyEmailRequest): Promise<{ success: true; message: string }> {
    const input = VerifyEmailRequestSchema.parse(rawInput);
    const tokenHash = hashToken(input.token);
    const now = new Date();

    let record: any = null;
    if (this.prisma.isDatabaseConnected()) {
      record = await this.prisma.emailVerificationToken.findUnique({
        where: { tokenHash },
      });
    } else {
      record = this.memEmailTokens.get(tokenHash) || null;
    }

    if (!record || record.usedAt !== null || now > record.expiresAt) {
      throw new BadRequestException('Invalid, expired, or already used email verification token.');
    }

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.$transaction([
        this.prisma.emailVerificationToken.update({
          where: { id: record.id },
          data: { usedAt: now },
        }),
        this.prisma.user.update({
          where: { id: record.userId },
          data: { emailVerified: true },
        }),
      ]);
    } else {
      record.usedAt = now;
      for (const u of this.memUsers.values()) {
        if (u.id === record.userId) {
          u.emailVerified = true;
          break;
        }
      }
    }

    return {
      success: true,
      message: 'Your email address has been successfully verified.',
    };
  }

  /**
   * Resend registration verification email
   */
  async resendVerification(rawInput: ResendVerificationRequest): Promise<{ success: true; message: string }> {
    const input = ResendVerificationRequestSchema.parse(rawInput);
    const normalizedEmail = input.email.toLowerCase().trim();

    let user: { id: string; email: string; firstName: string; emailVerified: boolean } | null = null;
    if (this.prisma.isDatabaseConnected()) {
      const dbU = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (dbU) user = { id: dbU.id, email: dbU.email, firstName: dbU.firstName, emailVerified: dbU.emailVerified };
    } else {
      const memU = this.memUsers.get(normalizedEmail);
      if (memU) user = { id: memU.id, email: memU.email, firstName: memU.firstName, emailVerified: memU.emailVerified };
    }

    if (user && !user.emailVerified) {
      const token = generateSecureToken(32);
      const tokenHash = hashToken(token);
      const appUrl = process.env.APP_URL || process.env.PUBLIC_APP_ORIGIN || 'http://localhost:3000';
      const link = `${appUrl}/verify-email?token=${token}`;

      if (this.prisma.isDatabaseConnected()) {
        await this.prisma.emailVerificationToken.create({
          data: {
            id: randomUUID(),
            tokenHash,
            userId: user.id,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        }).catch(() => {});
      } else {
        this.memEmailTokens.set(tokenHash, {
          tokenHash,
          userId: user.id,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          usedAt: null,
        });
      }

      this.emailService.sendEmailVerification(normalizedEmail, link, user.firstName)
        .catch((err) => this.logger.warn(`Failed to dispatch verification email: ${err.message}`));
    }

    return {
      success: true,
      message: 'If this account is registered and unverified, verification instructions have been dispatched.',
    };
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
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Session refresh is unavailable. Database connection required in production.');
      }
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
          emailVerified: Boolean(dbUser.emailVerified),
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
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Session logout is unavailable. Database connection required in production.');
      }
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
      try {
        const user = await this.prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (user) userId = user.id;
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new ServiceUnavailableException('Password recovery is unavailable. Durable storage offline.');
        }
        this.logger.warn(`Failed to query user for password reset in DB: ${err.message}`);
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Password recovery is unavailable. Durable storage offline.');
      }
      const user = this.memUsers.get(normalizedEmail);
      if (user) userId = user.id;
    }

    if (userId) {
      if (this.prisma.isDatabaseConnected()) {
        try {
          const tokenHash = hashToken(token);
          await this.prisma.passwordResetToken.create({
            data: {
              id: randomUUID(),
              tokenHash,
              userId,
              expiresAt,
            },
          });
        } catch (err: any) {
          if (process.env.NODE_ENV === 'production') {
            throw new ServiceUnavailableException('Password reset token generation failed. Durable storage offline.');
          }
          this.logger.warn(`Failed to persist password reset token in DB: ${err.message}`);
        }
      } else if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Password reset token generation failed. Durable storage offline.');
      }

      this.memResetTokens.set(token, { userId, expiresAt });

      const appUrl = process.env.APP_URL || process.env.PUBLIC_APP_ORIGIN || 'http://localhost:3000';
      const resetLink = `${appUrl}/reset-password?token=${token}`;
      this.emailService.sendPasswordReset(normalizedEmail, resetLink)
        .catch((err) => this.logger.warn(`Failed to dispatch password reset email: ${err.message}`));
    }

    // Always return generic success to prevent email enumeration
    return {
      message: 'If an account exists with this email, password reset instructions have been generated.',
      ...(process.env.NODE_ENV !== 'production' ? { resetToken: token } : {}),
    };
  }

  /**
   * Reset password with valid token
   */
  async resetPassword(input: ResetPasswordRequest): Promise<{ success: true }> {
    let targetUserId: string | null = null;
    let dbTokenId: string | null = null;

    if (this.prisma.isDatabaseConnected()) {
      try {
        const tokenHash = hashToken(input.token);
        const dbRecord = await this.prisma.passwordResetToken.findUnique({
          where: { tokenHash },
        });

        if (dbRecord && !dbRecord.usedAt && new Date() <= dbRecord.expiresAt) {
          targetUserId = dbRecord.userId;
          dbTokenId = dbRecord.id;
        }
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new ServiceUnavailableException('Password reset verification failed. Durable storage offline.');
        }
        this.logger.warn(`Failed to query reset token in DB: ${err.message}`);
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Password reset verification failed. Durable storage offline.');
    }

    // Check memory fallback if not resolved from DB
    if (!targetUserId) {
      const memRecord = this.memResetTokens.get(input.token);
      if (memRecord && new Date() <= memRecord.expiresAt) {
        targetUserId = memRecord.userId;
      }
    }

    if (!targetUserId) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const newHashedPassword = await hashPassword(input.newPassword);

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.user.update({
        where: { id: targetUserId },
        data: { hashedPassword: newHashedPassword },
      });

      // Mark token as used if persisted
      if (dbTokenId) {
        await this.prisma.passwordResetToken.update({
          where: { id: dbTokenId },
          data: { usedAt: new Date() },
        }).catch(() => {});
      }

      // Revoke all existing sessions
      await this.prisma.refreshToken.updateMany({
        where: { userId: targetUserId },
        data: { revoked: true },
      });
    } else {
      for (const u of this.memUsers.values()) {
        if (u.id === targetUserId) {
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
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('User profile lookup is unavailable. Database connection required in production.');
      }
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
    existingFamilyId?: string,
    customExpiresIn?: number
  ): Promise<AuthResponseData> {
    const expiresIn = customExpiresIn || 900; // default 15 minutes, or custom for demo
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
