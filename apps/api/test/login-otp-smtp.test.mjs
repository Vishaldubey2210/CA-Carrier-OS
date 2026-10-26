import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { AuthService } from '../dist/modules/auth/auth.service.js';
import { WorkspaceService } from '../dist/modules/workspace/workspace.service.js';
import { EmailService } from '../dist/modules/email/email.service.js';
import { UserRole } from '@ca-career-os/shared';

describe('Login Email OTP & SMTP Integration Test Suite', () => {
  const mockPrisma = {
    isDatabaseConnected: () => false,
  };

  let emailService;
  let workspaceService;
  let authService;
  let testUser;

  beforeEach(async () => {
    emailService = new EmailService();
    emailService.setMockMode(true);
    emailService.clearDispatchedEmails();

    workspaceService = new WorkspaceService(mockPrisma);
    authService = new AuthService(mockPrisma, workspaceService, emailService);

    // Register a baseline test user
    const regRes = await authService.register({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'SecurePassword2026!',
      firstName: 'Vikram',
      lastName: 'Malhotra',
      role: UserRole.CANDIDATE,
    });
    testUser = regRes.user;
  });

  test('1. Correct password initiates the OTP challenge and dispatches email', async () => {
    const loginRes = await authService.login({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'SecurePassword2026!',
    });

    assert.equal(loginRes.requiresOtp, true);
    assert.ok(loginRes.challengeId);
    assert.match(loginRes.maskedEmail, /^c\*\*\*p@cacareeros\.com$/);
    assert.equal(loginRes.expiresInSeconds, 300);
    assert.equal(loginRes.resendCooldownSeconds, 60);

    // Verify OTP was dispatched via EmailService
    const emails = emailService.getDispatchedEmails();
    assert.equal(emails.length >= 1, true);
    const otpEmail = emails.find(
      (e) => e.to === 'ca.candidate.otp@cacareeros.com' && e.subject.includes('sign-in verification code')
    );
    assert.ok(otpEmail);
    assert.ok(otpEmail.subject.includes('sign-in verification code'));
  });

  test('2. Wrong password does not initiate authenticated access or challenge', async () => {
    await assert.rejects(
      async () => {
        await authService.login({
          email: 'ca.candidate.otp@cacareeros.com',
          password: 'WrongPassword999!',
        });
      },
      (err) => err.status === 401 && err.message.includes('Invalid email or password')
    );

    // No OTP should be dispatched for invalid credentials
    const emails = emailService.getDispatchedEmails().filter((e) => e.to === 'ca.candidate.otp@cacareeros.com' && e.subject.includes('verification code'));
    assert.equal(emails.length, 0);
  });

  test('3. No session/token is issued before OTP verification', async () => {
    const loginRes = await authService.login({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'SecurePassword2026!',
    });

    // Zero tokens in response
    assert.equal(loginRes.accessToken, undefined);
    assert.equal(loginRes.refreshToken, undefined);
  });

  test('4. Valid OTP completes login and returns authenticated session tokens', async () => {
    const loginRes = await authService.login({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'SecurePassword2026!',
    });

    const otpCode = authService.getLatestOtpForTesting('ca.candidate.otp@cacareeros.com');
    assert.ok(otpCode);
    assert.match(otpCode, /^\d{6}$/);

    const verifyRes = await authService.verifyOtp({
      challengeId: loginRes.challengeId,
      code: otpCode,
    });

    assert.ok(verifyRes.accessToken, 'Must issue JWT accessToken');
    assert.ok(verifyRes.refreshToken, 'Must issue refresh token');
    assert.equal(verifyRes.user.email, 'ca.candidate.otp@cacareeros.com');
    assert.ok(verifyRes.defaultWorkspaceId);
  });

  test('5. Invalid OTP is rejected with remaining attempt count', async () => {
    const loginRes = await authService.login({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'SecurePassword2026!',
    });

    await assert.rejects(
      async () => {
        await authService.verifyOtp({
          challengeId: loginRes.challengeId,
          code: '000000',
        });
      },
      (err) => err.status === 401 && err.message.includes('4 attempt(s) remaining')
    );
  });

  test('6. Reused OTP is rejected (Single-use enforcement)', async () => {
    const loginRes = await authService.login({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'SecurePassword2026!',
    });

    const otpCode = authService.getLatestOtpForTesting('ca.candidate.otp@cacareeros.com');

    // First use: succeeds
    await authService.verifyOtp({
      challengeId: loginRes.challengeId,
      code: otpCode,
    });

    // Second use: must be rejected
    await assert.rejects(
      async () => {
        await authService.verifyOtp({
          challengeId: loginRes.challengeId,
          code: otpCode,
        });
      },
      (err) => err.status === 401 && err.message.includes('already been used')
    );
  });

  test('7. Fifth failed attempt triggers challenge lockout', async () => {
    const loginRes = await authService.login({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'SecurePassword2026!',
    });

    // 4 failed attempts
    for (let i = 0; i < 4; i++) {
      await assert.rejects(
        async () => {
          await authService.verifyOtp({
            challengeId: loginRes.challengeId,
            code: '111111',
          });
        },
        (err) => err.status === 401
      );
    }

    // 5th failed attempt: triggers lockout
    await assert.rejects(
      async () => {
        await authService.verifyOtp({
          challengeId: loginRes.challengeId,
          code: '111111',
        });
      },
      (err) => err.status === 401 && err.message.includes('Maximum verification attempts exceeded')
    );

    // Subsequent attempt even with correct code is locked out
    const otpCode = authService.getLatestOtpForTesting('ca.candidate.otp@cacareeros.com');
    await assert.rejects(
      async () => {
        await authService.verifyOtp({
          challengeId: loginRes.challengeId,
          code: otpCode,
        });
      },
      (err) => err.status === 401 && err.message.includes('Maximum verification attempts exceeded')
    );
  });

  test('8. Resend cooldown (60 seconds) is strictly enforced', async () => {
    const loginRes = await authService.login({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'SecurePassword2026!',
    });

    // Immediate resend should be blocked by cooldown
    await assert.rejects(
      async () => {
        await authService.resendOtp({ challengeId: loginRes.challengeId });
      },
      (err) => err.status === 429 && err.message.includes('Please wait')
    );
  });

  test('9. SMTP delivery failure aborts authentication and does not authenticate user', async () => {
    const originalSend = emailService.sendLoginOtp;
    emailService.sendLoginOtp = async () => {
      throw new Error('SMTP connection timed out');
    };

    try {
      await assert.rejects(
        async () => {
          await authService.login({
            email: 'ca.candidate.otp@cacareeros.com',
            password: 'SecurePassword2026!',
          });
        },
        (err) => err.status === 503 && err.message.includes('Failed to dispatch verification email')
      );
    } finally {
      emailService.sendLoginOtp = originalSend;
    }
  });

  test('10. Challenge from one account cannot authenticate another account', async () => {
    // Register second user
    await authService.register({
      email: 'user.two@cacareeros.com',
      password: 'SecurePassword2026!',
      firstName: 'Amit',
      lastName: 'Roy',
      role: UserRole.CANDIDATE,
    });

    const loginRes1 = await authService.login({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'SecurePassword2026!',
    });

    const otpCode1 = authService.getLatestOtpForTesting('ca.candidate.otp@cacareeros.com');

    // Verifying challenge 1 returns user 1, never user 2
    const verifyRes = await authService.verifyOtp({
      challengeId: loginRes1.challengeId,
      code: otpCode1,
    });

    assert.equal(verifyRes.user.email, 'ca.candidate.otp@cacareeros.com');
    assert.notEqual(verifyRes.user.email, 'user.two@cacareeros.com');
  });

  test('11. Email verification on registration succeeds with valid token', async () => {
    const emails = emailService.getDispatchedEmails();
    const verifEmail = emails.find((e) => e.subject.includes('Verify your email address'));
    assert.ok(verifEmail, 'Registration should trigger verification email');

    // Extract token from email HTML
    const match = verifEmail.html.match(/token=([a-f0-9]+)/);
    assert.ok(match && match[1], 'Must include verification token in email link');
    const token = match[1];

    const res = await authService.verifyEmail({ token });
    assert.equal(res.success, true);
    assert.ok(res.message.includes('successfully verified'));

    // Reusing the same token fails
    await assert.rejects(
      async () => {
        await authService.verifyEmail({ token });
      },
      (err) => err.status === 400 && err.message.includes('already used')
    );
  });

  test('12. Password reset flow dispatches branded email and resets password securely', async () => {
    const forgotRes = await authService.forgotPassword({
      email: 'ca.candidate.otp@cacareeros.com',
    });

    assert.ok(forgotRes.message);
    const emails = emailService.getDispatchedEmails();
    const resetEmail = emails.find((e) => e.subject.includes('Reset your account password'));
    assert.ok(resetEmail, 'Must dispatch password reset email');

    const match = resetEmail.html.match(/token=([a-f0-9]+)/);
    assert.ok(match && match[1]);
    const resetToken = match[1];

    // Reset password with token
    const resetRes = await authService.resetPassword({
      token: resetToken,
      newPassword: 'BrandNewPassword2026!',
    });
    assert.equal(resetRes.success, true);

    // Login with new password initiates OTP
    const newLoginRes = await authService.login({
      email: 'ca.candidate.otp@cacareeros.com',
      password: 'BrandNewPassword2026!',
    });
    assert.equal(newLoginRes.requiresOtp, true);

    // Old password fails
    await assert.rejects(
      async () => {
        await authService.login({
          email: 'ca.candidate.otp@cacareeros.com',
          password: 'SecurePassword2026!',
        });
      },
      (err) => err.status === 401
    );
  });
});
