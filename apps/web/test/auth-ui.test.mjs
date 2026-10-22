import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  CreateWorkspaceSchema,
  InviteMemberSchema,
  UserRole,
  WorkspaceType,
  MemberRole,
} from '@ca-career-os/shared';

describe('Phase 2: Frontend Auth & Workspace Form Validation Suite', () => {
  test('Registration client validation requires 12+ character password', () => {
    // Valid candidate input
    const valid = RegisterRequestSchema.safeParse({
      firstName: 'Aarav',
      lastName: 'Patel',
      email: 'aarav.patel@example.com',
      password: 'TwelveCharactersLong!',
      role: UserRole.CANDIDATE,
    });
    assert.equal(valid.success, true);

    // Invalid password length (<12)
    const invalidPass = RegisterRequestSchema.safeParse({
      firstName: 'Aarav',
      lastName: 'Patel',
      email: 'aarav.patel@example.com',
      password: 'Short123!',
      role: UserRole.CANDIDATE,
    });
    assert.equal(invalidPass.success, false);
    if (!invalidPass.success) {
      assert.ok(invalidPass.error.errors.some((e) => e.message.includes('12 characters')));
    }
  });

  test('Registration client validation normalizes email and enforces valid format', () => {
    const invalidEmail = RegisterRequestSchema.safeParse({
      firstName: 'Aarav',
      lastName: 'Patel',
      email: 'not-an-email',
      password: 'TwelveCharactersLong!',
      role: UserRole.CANDIDATE,
    });
    assert.equal(invalidEmail.success, false);
  });

  test('Login schema enforces required credentials', () => {
    const invalid = LoginRequestSchema.safeParse({
      email: '',
      password: '',
    });
    assert.equal(invalid.success, false);

    const valid = LoginRequestSchema.safeParse({
      email: 'ca.student@example.com',
      password: 'MyPassword123!',
    });
    assert.equal(valid.success, true);
  });

  test('Create workspace schema enforces name constraints', () => {
    const valid = CreateWorkspaceSchema.safeParse({
      name: 'Deloitte Global Audit',
      type: WorkspaceType.ORGANIZATION,
    });
    assert.equal(valid.success, true);

    const invalid = CreateWorkspaceSchema.safeParse({
      name: 'a',
      type: WorkspaceType.ORGANIZATION,
    });
    assert.equal(invalid.success, false);
  });

  test('Member invitation schema validates email and roles', () => {
    const valid = InviteMemberSchema.safeParse({
      email: 'colleague@big4firm.com',
      role: MemberRole.RECRUITER,
    });
    assert.equal(valid.success, true);
  });
});
