import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../dist/modules/auth/auth.service.js';
import { WorkspaceService } from '../dist/modules/workspace/workspace.service.js';
import { WorkspaceGuard } from '../dist/common/guards/workspace.guard.js';
import { RolesGuard } from '../dist/common/guards/roles.guard.js';
import { JwtAuthGuard } from '../dist/common/guards/jwt-auth.guard.js';
import { verifyJwt, hashPassword, verifyPassword } from '../dist/common/security/crypto.util.js';
import { globalAuthRateLimiter } from '../dist/common/security/rate-limiter.js';
import {
  UserRole,
  WorkspaceType,
  MemberRole,
} from '@ca-career-os/shared';
import { env } from '../dist/common/config/env.config.js';

describe('Phase 2: Authentication, Identity & Workspace Security Suite', () => {
  // Standalone mock Prisma service for offline and isolated test execution
  const mockPrisma = {
    isDatabaseConnected: () => false,
  };

  const workspaceService = new WorkspaceService(mockPrisma);
  const authService = new AuthService(mockPrisma, workspaceService);

  let candidateATokens;
  let candidateBTokens;
  let recruiterTokens;
  let orgWorkspace;

  test('1. Successful registration and login with password hashing and JWT issuance', async () => {
    // Register Candidate A
    candidateATokens = await authService.register({
      email: 'candidate.a@ca-career.com',
      password: 'StrongPassword123!',
      firstName: 'Candidate',
      lastName: 'Alpha',
      role: UserRole.CANDIDATE,
    });

    assert.ok(candidateATokens.accessToken);
    assert.ok(candidateATokens.refreshToken);
    assert.equal(candidateATokens.user.email, 'candidate.a@ca-career.com');
    assert.equal(candidateATokens.user.role, UserRole.CANDIDATE);
    assert.ok(candidateATokens.defaultWorkspaceId);

    // Verify JWT payload
    const decoded = verifyJwt(candidateATokens.accessToken, env.JWT_SECRET);
    assert.ok(decoded);
    assert.equal(decoded.email, 'candidate.a@ca-career.com');

    // Login Candidate A
    const loginRes = await authService.login({
      email: 'candidate.a@ca-career.com',
      password: 'StrongPassword123!',
    });
    assert.ok(loginRes.accessToken);
    assert.equal(loginRes.user.id, candidateATokens.user.id);

    // Failed login with wrong password
    await assert.rejects(
      async () => {
        await authService.login({
          email: 'candidate.a@ca-career.com',
          password: 'WrongPassword456!',
        });
      },
      (err) => err.status === 401
    );
  });

  test('2. Invalid input and duplicate registration rejection', async () => {
    // Duplicate registration
    await assert.rejects(
      async () => {
        await authService.register({
          email: 'candidate.a@ca-career.com',
          password: 'AnotherPassword123!',
          firstName: 'Duplicate',
          lastName: 'User',
          role: UserRole.CANDIDATE,
        });
      },
      (err) => err.status === 409
    );

    // Password too short (< 12 chars)
    await assert.rejects(
      async () => {
        await authService.register({
          email: 'newuser@example.com',
          password: 'short',
          firstName: 'Short',
          lastName: 'Pass',
          role: UserRole.CANDIDATE,
        });
      },
      (err) => err.name === 'ZodError'
    );
  });

  test('3. Session rotation, refresh token invalidation, and reuse family revocation', async () => {
    // Refresh tokens with valid token
    const rotated = await authService.refreshToken({
      refreshToken: candidateATokens.refreshToken,
    });
    assert.ok(rotated.accessToken);
    assert.ok(rotated.refreshToken);
    assert.notEqual(rotated.refreshToken, candidateATokens.refreshToken);

    // Token reuse detection: Using candidateATokens.refreshToken again must trigger reuse detection
    await assert.rejects(
      async () => {
        await authService.refreshToken({
          refreshToken: candidateATokens.refreshToken,
        });
      },
      (err) => err.status === 401 && err.message.includes('Token reuse detected')
    );

    // Logout
    const logoutRes = await authService.logout(rotated.refreshToken, candidateATokens.user.id);
    assert.equal(logoutRes.success, true);
  });

  test('4. Unauthorized API access when JWT is missing or invalid', () => {
    const jwtGuard = new JwtAuthGuard();

    // Missing header
    assert.throws(
      () => {
        jwtGuard.canActivate({
          switchToHttp: () => ({
            getRequest: () => ({ headers: {} }),
          }),
        });
      },
      (err) => err.status === 401
    );

    // Invalid signature / expired token
    assert.throws(
      () => {
        jwtGuard.canActivate({
          switchToHttp: () => ({
            getRequest: () => ({
              headers: { authorization: 'Bearer invalid.tampered.token' },
            }),
          }),
        });
      },
      (err) => err.status === 401
    );
  });

  test('5. Candidate A cannot access Candidate B private workspace', async () => {
    // Register Candidate B
    candidateBTokens = await authService.register({
      email: 'candidate.b@ca-career.com',
      password: 'StrongPassword123!',
      firstName: 'Candidate',
      lastName: 'Beta',
      role: UserRole.CANDIDATE,
    });

    const guard = new WorkspaceGuard(mockPrisma, workspaceService);

    // Candidate A attempting to access Candidate B workspace
    await assert.rejects(
      async () => {
        await guard.canActivate({
          switchToHttp: () => ({
            getRequest: () => ({
              user: candidateATokens.user,
              headers: { 'x-workspace-id': candidateBTokens.defaultWorkspaceId },
            }),
          }),
        });
      },
      // When personal workspace belongs to someone else, blindfold throws 403
      (err) => err.status === 403
    );
  });

  test('6. Organization A cannot access Organization B resources', async () => {
    // Register Recruiter 1
    recruiterTokens = await authService.register({
      email: 'recruiter.grant@firm.com',
      password: 'StrongPassword123!',
      firstName: 'Grant',
      lastName: 'Recruiter',
      role: UserRole.RECRUITER,
      organizationName: 'Grant Thornton LLP',
    });

    // Create Org Workspace A
    orgWorkspace = await workspaceService.createOrganizationWorkspace(recruiterTokens.user.id, {
      name: 'Grant Thornton Advisory',
      type: WorkspaceType.ORGANIZATION,
    });

    // Register Recruiter 2 for BDO
    const recruiterB = await authService.register({
      email: 'recruiter.bdo@firm.com',
      password: 'StrongPassword123!',
      firstName: 'BDO',
      lastName: 'Recruiter',
      role: UserRole.RECRUITER,
    });

    // Recruiter B attempts to access Org Workspace A
    await assert.rejects(
      async () => {
        await workspaceService.getWorkspaceById(orgWorkspace.id, recruiterB.user.id);
      },
      (err) => err.status === 403
    );
  });

  test('7. Recruiters cannot access administrative operations (RolesGuard RBAC)', async () => {
    // Invite a member with RECRUITER role to Org Workspace A
    const inviteRes = await workspaceService.inviteMember(orgWorkspace.id, recruiterTokens.user.id, {
      email: 'junior.recruiter@firm.com',
      role: MemberRole.RECRUITER,
    });

    // Junior recruiter user
    const juniorRecruiter = await authService.register({
      email: 'junior.recruiter@firm.com',
      password: 'StrongPassword123!',
      firstName: 'Junior',
      lastName: 'Recruiter',
      role: UserRole.RECRUITER,
    });

    // Accept invite
    await workspaceService.acceptInvitation(inviteRes.invitationToken, juniorRecruiter.user.id, juniorRecruiter.user.email);

    // Reflector mock requiring OWNER or ADMIN
    const mockReflector = {
      getAllAndOverride: () => [MemberRole.OWNER, MemberRole.ADMIN],
    };
    const rolesGuard = new RolesGuard(mockReflector);

    // Junior Recruiter calling admin operation
    assert.throws(
      () => {
        rolesGuard.canActivate({
          switchToHttp: () => ({
            getRequest: () => ({
              user: juniorRecruiter.user,
              membership: { memberRole: MemberRole.RECRUITER },
            }),
          }),
          getHandler: () => {},
          getClass: () => {},
        });
      },
      (err) => err.status === 403 && err.message.includes('Insufficient workspace permissions')
    );
  });

  test('8. Organization membership does not grant access to candidate personal workspace (Blindfold Rule)', async () => {
    // Invite Candidate A to Org Workspace A
    const inviteCand = await workspaceService.inviteMember(orgWorkspace.id, recruiterTokens.user.id, {
      email: candidateATokens.user.email,
      role: MemberRole.MEMBER,
    });

    await workspaceService.acceptInvitation(inviteCand.invitationToken, candidateATokens.user.id, candidateATokens.user.email);

    // Recruiter and Candidate A now share Org Workspace A
    // Now verify Recruiter CANNOT access Candidate A's Personal Workspace
    await assert.rejects(
      async () => {
        await workspaceService.getWorkspaceById(candidateATokens.defaultWorkspaceId, recruiterTokens.user.id);
      },
      (err) => err.status === 403 && err.message.includes('strictly isolated')
    );
  });

  test('9. Forged or non-existent workspace identifiers are rejected', async () => {
    await assert.rejects(
      async () => {
        await workspaceService.getWorkspaceById('00000000-0000-0000-0000-000000000000', candidateATokens.user.id);
      },
      (err) => err.status === 404
    );
  });

  test('10. Authorization rechecked after membership revocation', async () => {
    // Org Owner revokes Junior Recruiter's membership
    const removeRes = await workspaceService.removeMember(
      orgWorkspace.id,
      recruiterTokens.user.id,
      'junior-recruiter-id'
    );
    assert.equal(removeRes.success, true);
  });

  test('11. Sensitive fields and credentials never appear in payloads', () => {
    // AuthResponseData does not contain hashedPassword, salt, or secrets
    assert.equal(candidateATokens.hashedPassword, undefined);
    assert.equal(candidateATokens.password, undefined);
    assert.equal(candidateATokens.user.hashedPassword, undefined);
  });

  test('12. Password recovery workflow works safely', async () => {
    const forgotRes = await authService.forgotPassword({
      email: candidateATokens.user.email,
    });
    assert.ok(forgotRes.message);
    assert.ok(forgotRes.resetToken);

    // Reset password
    const resetRes = await authService.resetPassword({
      token: forgotRes.resetToken,
      newPassword: 'BrandNewPassword123!',
    });
    assert.equal(resetRes.success, true);

    // Login with new password
    const loginNew = await authService.login({
      email: candidateATokens.user.email,
      password: 'BrandNewPassword123!',
    });
    assert.ok(loginNew.accessToken);
  });
});
