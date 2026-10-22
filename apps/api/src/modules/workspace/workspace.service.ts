import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CreateWorkspaceInput,
  CreateWorkspaceSchema,
  InviteMemberInput,
  InviteMemberSchema,
  WorkspaceType,
  MemberRole,
  WorkspaceSummary,
  WorkspaceMemberDetail,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { generateSecureToken } from '../../common/security/crypto.util.js';

interface InMemoryWorkspace {
  id: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  ownerId: string;
  createdAt: Date;
}

interface InMemoryMembership {
  workspaceId: string;
  userId: string;
  memberRole: MemberRole;
  isDefault: boolean;
  joinedAt: Date;
}

interface InMemoryInvitation {
  id: string;
  workspaceId: string;
  email: string;
  role: MemberRole;
  invitedById: string;
  token: string;
  accepted: boolean;
  expiresAt: Date;
  createdAt: Date;
}

@Injectable()
export class WorkspaceService {
  // In-memory fallback stores
  private readonly memWorkspaces = new Map<string, InMemoryWorkspace>();
  private readonly memMemberships = new Map<string, InMemoryMembership[]>(); // workspaceId -> memberships
  private readonly memInvitations = new Map<string, InMemoryInvitation>(); // token -> invitation

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Provision personal workspace for candidate in offline memory store
   */
  createPersonalWorkspace(userId: string, firstName: string, customId?: string): { id: string; name: string } {
    const id = customId || randomUUID();
    const now = new Date();
    const ws: InMemoryWorkspace = {
      id,
      name: `${firstName}'s Personal Workspace`,
      slug: `personal-${userId.slice(0, 8)}`,
      type: WorkspaceType.PERSONAL,
      ownerId: userId,
      createdAt: now,
    };
    this.memWorkspaces.set(id, ws);
    this.memMemberships.set(id, [
      {
        workspaceId: id,
        userId,
        memberRole: MemberRole.OWNER,
        isDefault: true,
        joinedAt: now,
      },
    ]);
    return { id, name: ws.name };
  }

  /**
   * List all workspaces where the user is an active member
   */
  async listUserWorkspaces(userId: string): Promise<WorkspaceSummary[]> {
    if (this.prisma.isDatabaseConnected()) {
      const memberships = await this.prisma.workspaceMembership.findMany({
        where: { userId },
        include: { workspace: true },
        orderBy: { joinedAt: 'asc' },
      });

      return memberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        type: m.workspace.type as unknown as WorkspaceType,
        ownerId: m.workspace.ownerId,
        role: m.memberRole as unknown as MemberRole,
        isDefault: m.isDefault,
        createdAt: m.workspace.createdAt.toISOString(),
      }));
    } else {
      const results: WorkspaceSummary[] = [];
      for (const [wsId, members] of this.memMemberships.entries()) {
        const mem = members.find((m) => m.userId === userId);
        const ws = this.memWorkspaces.get(wsId);
        if (mem && ws) {
          results.push({
            id: ws.id,
            name: ws.name,
            slug: ws.slug,
            type: ws.type,
            ownerId: ws.ownerId,
            role: mem.memberRole,
            isDefault: mem.isDefault,
            createdAt: ws.createdAt.toISOString(),
          });
        }
      }
      return results;
    }
  }

  /**
   * Get single workspace by ID with strict tenant boundary enforcement
   */
  async getWorkspaceById(workspaceId: string, userId: string): Promise<WorkspaceSummary> {
    if (this.prisma.isDatabaseConnected()) {
      const workspace = await this.prisma.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException(`Workspace ${workspaceId} not found`);
      }

      // Candidate Blindfold rule
      if (workspace.type === (WorkspaceType.PERSONAL as any) && workspace.ownerId !== userId) {
        throw new ForbiddenException(
          'Access denied: Candidate personal workspaces are strictly isolated.'
        );
      }

      const membership = await this.prisma.workspaceMembership.findUnique({
        where: { workspaceId_userId: { workspaceId, userId } },
      });

      if (!membership) {
        throw new ForbiddenException('User is not an authorized member of this workspace');
      }

      return {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        type: workspace.type as unknown as WorkspaceType,
        ownerId: workspace.ownerId,
        role: membership.memberRole as unknown as MemberRole,
        isDefault: membership.isDefault,
        createdAt: workspace.createdAt.toISOString(),
      };
    } else {
      const ws = this.memWorkspaces.get(workspaceId);
      if (!ws) {
        throw new NotFoundException(`Workspace ${workspaceId} not found`);
      }

      if (ws.type === WorkspaceType.PERSONAL && ws.ownerId !== userId) {
        throw new ForbiddenException(
          'Access denied: Candidate personal workspaces are strictly isolated.'
        );
      }

      const members = this.memMemberships.get(workspaceId) || [];
      const mem = members.find((m) => m.userId === userId);
      if (!mem) {
        throw new ForbiddenException('User is not an authorized member of this workspace');
      }

      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        type: ws.type,
        ownerId: ws.ownerId,
        role: mem.memberRole,
        isDefault: mem.isDefault,
        createdAt: ws.createdAt.toISOString(),
      };
    }
  }

  /**
   * Create a new organization workspace
   */
  async createOrganizationWorkspace(
    userId: string,
    rawInput: CreateWorkspaceInput
  ): Promise<WorkspaceSummary> {
    const input = CreateWorkspaceSchema.parse(rawInput);
    const workspaceId = randomUUID();
    const cleanSlug = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 30);
    const slug = `${cleanSlug}-${workspaceId.slice(0, 6)}`;

    if (this.prisma.isDatabaseConnected()) {
      const ws = await this.prisma.workspace.create({
        data: {
          id: workspaceId,
          name: input.name,
          slug,
          type: WorkspaceType.ORGANIZATION as any,
          ownerId: userId,
          memberships: {
            create: {
              userId,
              memberRole: MemberRole.OWNER as any,
              isDefault: false,
            },
          },
        },
      });

      await this.prisma.auditEvent.create({
        data: {
          actorId: userId,
          workspaceId,
          operation: 'WORKSPACE_CREATED',
          resourceType: 'Workspace',
          resourceId: workspaceId,
          outcome: 'SUCCESS',
          correlationId: randomUUID(),
          payloadSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          durationMs: 0,
        },
      });

      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        type: ws.type as unknown as WorkspaceType,
        ownerId: ws.ownerId,
        role: MemberRole.OWNER,
        isDefault: false,
        createdAt: ws.createdAt.toISOString(),
      };
    } else {
      const now = new Date();
      this.memWorkspaces.set(workspaceId, {
        id: workspaceId,
        name: input.name,
        slug,
        type: WorkspaceType.ORGANIZATION,
        ownerId: userId,
        createdAt: now,
      });

      this.memMemberships.set(workspaceId, [
        {
          workspaceId,
          userId,
          memberRole: MemberRole.OWNER,
          isDefault: false,
          joinedAt: now,
        },
      ]);

      return {
        id: workspaceId,
        name: input.name,
        slug,
        type: WorkspaceType.ORGANIZATION,
        ownerId: userId,
        role: MemberRole.OWNER,
        isDefault: false,
        createdAt: now.toISOString(),
      };
    }
  }

  /**
   * List members of a workspace
   */
  async listMembers(workspaceId: string, userId: string): Promise<WorkspaceMemberDetail[]> {
    // Check caller access
    await this.getWorkspaceById(workspaceId, userId);

    if (this.prisma.isDatabaseConnected()) {
      const members = await this.prisma.workspaceMembership.findMany({
        where: { workspaceId },
        include: { user: true },
        orderBy: { joinedAt: 'asc' },
      });

      return members.map((m) => ({
        id: m.id,
        userId: m.userId,
        email: m.user.email,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        role: m.memberRole as unknown as MemberRole,
        joinedAt: m.joinedAt.toISOString(),
      }));
    } else {
      const members = this.memMemberships.get(workspaceId) || [];
      return members.map((m) => ({
        id: randomUUID(),
        userId: m.userId,
        email: 'user@example.com',
        firstName: 'Member',
        lastName: 'User',
        role: m.memberRole,
        joinedAt: m.joinedAt.toISOString(),
      }));
    }
  }

  /**
   * Invite member to an organization workspace (OWNER / ADMIN only)
   */
  async inviteMember(
    workspaceId: string,
    callerId: string,
    rawInput: InviteMemberInput
  ) {
    const input = InviteMemberSchema.parse(rawInput);
    const callerWs = await this.getWorkspaceById(workspaceId, callerId);

    // Only OWNER or ADMIN can invite
    if (callerWs.role !== MemberRole.OWNER && callerWs.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Only workspace owners and administrators can invite new members');
    }

    // Personal workspaces cannot invite multi-tenant members
    if (callerWs.type === WorkspaceType.PERSONAL) {
      throw new BadRequestException('Personal candidate workspaces cannot invite external members');
    }

    const token = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    if (this.prisma.isDatabaseConnected()) {
      const invitation = await this.prisma.workspaceInvitation.create({
        data: {
          workspaceId,
          email: input.email,
          role: input.role as any,
          invitedById: callerId,
          token,
          expiresAt,
        },
      });

      await this.prisma.auditEvent.create({
        data: {
          actorId: callerId,
          workspaceId,
          operation: 'MEMBER_INVITED',
          resourceType: 'WorkspaceMembership',
          resourceId: invitation.id,
          outcome: 'SUCCESS',
          correlationId: randomUUID(),
          payloadSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          durationMs: 0,
        },
      });

      return {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role as unknown as MemberRole,
        invitationToken: invitation.token,
        expiresAt: invitation.expiresAt.toISOString(),
      };
    } else {
      const id = randomUUID();
      const inv: InMemoryInvitation = {
        id,
        workspaceId,
        email: input.email,
        role: input.role,
        invitedById: callerId,
        token,
        accepted: false,
        expiresAt,
        createdAt: new Date(),
      };
      this.memInvitations.set(token, inv);
      return {
        id,
        email: input.email,
        role: input.role,
        invitationToken: token,
        expiresAt: expiresAt.toISOString(),
      };
    }
  }

  /**
   * Remove member or revoke membership (OWNER / ADMIN only)
   */
  async removeMember(workspaceId: string, callerId: string, targetUserId: string) {
    const callerWs = await this.getWorkspaceById(workspaceId, callerId);

    if (callerWs.role !== MemberRole.OWNER && callerWs.role !== MemberRole.ADMIN) {
      throw new ForbiddenException('Only workspace owners and administrators can remove members');
    }

    if (callerWs.ownerId === targetUserId) {
      throw new BadRequestException('Cannot remove the workspace owner');
    }

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.workspaceMembership.deleteMany({
        where: {
          workspaceId,
          userId: targetUserId,
        },
      });

      await this.prisma.auditEvent.create({
        data: {
          actorId: callerId,
          workspaceId,
          operation: 'MEMBER_REMOVED',
          resourceType: 'WorkspaceMembership',
          resourceId: targetUserId,
          outcome: 'SUCCESS',
          correlationId: randomUUID(),
          payloadSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          durationMs: 0,
        },
      });
    } else {
      const members = this.memMemberships.get(workspaceId) || [];
      const updated = members.filter((m) => m.userId !== targetUserId);
      this.memMemberships.set(workspaceId, updated);
    }

    return { success: true, removedUserId: targetUserId };
  }

  /**
   * Accept invitation using token
   */
  async acceptInvitation(token: string, userId: string, userEmail: string) {
    let invitation: {
      id: string;
      workspaceId: string;
      email: string;
      role: MemberRole;
      accepted: boolean;
      expiresAt: Date;
    } | null = null;

    if (this.prisma.isDatabaseConnected()) {
      const dbInv = await this.prisma.workspaceInvitation.findUnique({
        where: { token },
      });
      if (dbInv) {
        invitation = {
          ...dbInv,
          role: dbInv.role as unknown as MemberRole,
        };
      }
    } else {
      invitation = this.memInvitations.get(token) || null;
    }

    if (!invitation) {
      throw new NotFoundException('Invitation token not found');
    }

    if (invitation.accepted) {
      throw new ConflictException('Invitation has already been accepted');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new ForbiddenException(
        `This invitation was issued to ${invitation.email}. Current user is logged in as ${userEmail}.`
      );
    }

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.$transaction(async (tx) => {
        await tx.workspaceMembership.create({
          data: {
            workspaceId: invitation!.workspaceId,
            userId,
            memberRole: invitation!.role as any,
            isDefault: false,
          },
        });
        await tx.workspaceInvitation.update({
          where: { token },
          data: { accepted: true },
        });
      });
    } else {
      invitation.accepted = true;
      const members = this.memMemberships.get(invitation.workspaceId) || [];
      members.push({
        workspaceId: invitation.workspaceId,
        userId,
        memberRole: invitation.role,
        isDefault: false,
        joinedAt: new Date(),
      });
      this.memMemberships.set(invitation.workspaceId, members);
    }

    return {
      success: true,
      workspaceId: invitation.workspaceId,
      role: invitation.role,
    };
  }
}
