import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { randomUUID } from 'node:crypto';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface DispatchedEmailRecord extends EmailOptions {
  messageId: string;
  dispatchedAt: Date;
  status: 'SENT' | 'SIMULATED' | 'FAILED';
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private isConfigured = false;
  private mockMode = false;

  // In-memory record for testing & observability
  public dispatchedEmails: DispatchedEmailRecord[] = [];

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = process.env.SMTP_HOST?.trim();
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 15000,
        tls: {
          // Never disable certificate validation in production
          rejectUnauthorized: true,
        },
      });
      this.isConfigured = true;
      this.mockMode = false;
      this.logger.log(`SMTP Transport initialized for ${host}:${port} (secure: ${secure})`);
    } else {
      this.isConfigured = false;
      this.mockMode = true;
      this.logger.warn(
        'SMTP credentials not fully configured (SMTP_HOST, SMTP_USER, SMTP_PASS). Active in MOCK/TEST mode.'
      );
    }
  }

  /**
   * Helper for tests to explicitly enable/disable mock transport
   */
  public setMockMode(enabled: boolean) {
    this.mockMode = enabled;
  }

  public isMockMode(): boolean {
    return this.mockMode;
  }

  public getDispatchedEmails(): DispatchedEmailRecord[] {
    return this.dispatchedEmails;
  }

  public getLatestEmailFor(to: string): DispatchedEmailRecord | undefined {
    return [...this.dispatchedEmails]
      .reverse()
      .find((e) => e.to.toLowerCase() === to.toLowerCase().trim());
  }

  public clearDispatchedEmails() {
    this.dispatchedEmails = [];
  }

  /**
   * Base email send method
   */
  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId: string; simulated: boolean }> {
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'noreply@cacareeros.com';
    const fromName = process.env.SMTP_FROM_NAME || 'CA Career OS';
    const fromAddress = `"${fromName}" <${fromEmail}>`;
    const messageId = `<${randomUUID()}@cacareeros.com>`;

    // If SMTP is not configured in production, reject immediately
    if (process.env.NODE_ENV === 'production' && !this.isConfigured && !this.mockMode) {
      this.logger.error('Attempted email dispatch in production with unconfigured SMTP transport.');
      throw new ServiceUnavailableException('Email dispatch service is currently unavailable. Contact system administration.');
    }

    if (this.mockMode || !this.isConfigured) {
      // Mock / Local Test transport
      const record: DispatchedEmailRecord = {
        ...options,
        to: options.to.toLowerCase().trim(),
        messageId,
        dispatchedAt: new Date(),
        status: 'SIMULATED',
      };
      this.dispatchedEmails.push(record);
      this.logger.log(`[MockSMTP] Email simulated to ${record.to} (Subject: "${record.subject}", MessageId: ${messageId})`);
      return { success: true, messageId, simulated: true };
    }

    // Real SMTP delivery via Nodemailer
    try {
      const info = await this.transporter!.sendMail({
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      const record: DispatchedEmailRecord = {
        ...options,
        to: options.to.toLowerCase().trim(),
        messageId: info.messageId || messageId,
        dispatchedAt: new Date(),
        status: 'SENT',
      };
      this.dispatchedEmails.push(record);
      this.logger.log(`[SMTP] Successfully delivered email to ${record.to} (MessageId: ${record.messageId})`);
      return { success: true, messageId: record.messageId, simulated: false };
    } catch (err: any) {
      this.logger.error(`[SMTP] Delivery failure to ${options.to}: ${err.message}`);
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Failed to deliver email through SMTP provider. Please try again later.');
      }
      throw new ServiceUnavailableException(`SMTP delivery failure: ${err.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Branded Email Templates
  // ---------------------------------------------------------------------------

  private renderBaseTemplate(title: string, bodyContent: string, actionButton?: { text: string; url: string }): string {
    const appUrl = process.env.APP_URL || process.env.PUBLIC_APP_ORIGIN || 'http://localhost:3000';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0c0e12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f1f5f9; }
    .wrapper { max-width: 580px; margin: 40px auto; background-color: #12161d; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; }
    .header { background-color: #171c26; padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; }
    .logo-badge { background: #1d4ed8; color: #ffffff; font-weight: 800; font-size: 16px; width: 34px; height: 34px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; border: 1px solid rgba(255,255,255,0.2); }
    .brand-name { font-size: 16px; font-weight: 700; color: #ffffff; letter-spacing: -0.01em; }
    .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .content h1 { font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
    .otp-box { background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.25); border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #60a5fa; font-family: 'Courier New', monospace; margin: 8px 0; }
    .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin: 20px 0; }
    .warning { font-size: 12px; color: #64748b; margin-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 16px; }
    .footer { background-color: #0c0e12; padding: 20px 32px; text-align: center; font-size: 11px; color: #475569; border-top: 1px solid rgba(255,255,255,0.04); }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <span class="logo-badge">CA</span>
      <span class="brand-name">CA Career OS &bull; Sovereign Career Platform</span>
    </div>
    <div class="content">
      ${bodyContent}
      ${actionButton ? `<div style="text-align: center;"><a href="${actionButton.url}" class="btn">${actionButton.text}</a></div>` : ''}
      <div class="warning">
        Security Note: If you did not initiate this request, your account may be compromised. Please secure your account immediately or notify <a href="mailto:security@cacareeros.com" style="color: #60a5fa; text-decoration: none;">security@cacareeros.com</a>.
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} CA Career OS &bull; Built exclusively for Indian Chartered Accountants &bull; ICAI Code of Ethics Compliant<br>
      <a href="${appUrl}/help" style="color: #64748b; text-decoration: none;">Help Center</a> &bull; <a href="${appUrl}/privacy" style="color: #64748b; text-decoration: none;">Privacy Policy</a>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * 1. Login OTP verification email
   */
  async sendLoginOtp(to: string, otpCode: string, firstName?: string): Promise<{ success: boolean; messageId: string }> {
    const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
    const bodyHtml = `
      <h1>Your Verification Code</h1>
      <p>${greeting}</p>
      <p>A sign-in attempt was initiated for your CA Career OS account. Use the single-use 6-digit verification code below to complete your authentication:</p>
      <div class="otp-box">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;">Single-Use Security Code</div>
        <div class="otp-code">${otpCode}</div>
        <div style="font-size: 12px; color: #94a3b8;">Valid for <strong>5 minutes</strong> &bull; Do not share this code with anyone</div>
      </div>
      <p style="font-size: 12px; color: #94a3b8;">This code can only be used once. For security reasons, maximum 5 verification attempts are allowed per code.</p>
    `;

    const bodyText = `${greeting}\n\nYour CA Career OS sign-in verification code is: ${otpCode}\n\nThis code is valid for 5 minutes and expires automatically. Do not share this code with anyone.\n\nIf you did not request this code, please secure your account immediately.`;

    const html = this.renderBaseTemplate('Sign-In Verification Code — CA Career OS', bodyHtml);
    return await this.sendEmail({
      to,
      subject: `[CA Career OS] ${otpCode} is your sign-in verification code`,
      html,
      text: bodyText,
    });
  }

  /**
   * 2. Account Email Verification on Registration
   */
  async sendEmailVerification(to: string, verificationLink: string, firstName?: string): Promise<{ success: boolean; messageId: string }> {
    const greeting = firstName ? `Welcome ${firstName},` : 'Welcome,';
    const bodyHtml = `
      <h1>Verify Your CA Career OS Account</h1>
      <p>${greeting}</p>
      <p>Thank you for registering on CA Career OS, the sovereign career operating system for Chartered Accountants. Please verify your email address to confirm your account credentials and activate your personal workspace.</p>
    `;

    const bodyText = `${greeting}\n\nPlease verify your CA Career OS account by clicking the link below:\n${verificationLink}\n\nThis verification link is valid for 24 hours.`;

    const html = this.renderBaseTemplate(
      'Verify Your Account — CA Career OS',
      bodyHtml,
      { text: 'Verify Email Address', url: verificationLink }
    );

    return await this.sendEmail({
      to,
      subject: '[CA Career OS] Verify your email address',
      html,
      text: bodyText,
    });
  }

  /**
   * 3. Password Reset
   */
  async sendPasswordReset(to: string, resetLink: string, firstName?: string): Promise<{ success: boolean; messageId: string }> {
    const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
    const bodyHtml = `
      <h1>Reset Your Account Password</h1>
      <p>${greeting}</p>
      <p>We received a request to reset the password for your CA Career OS account. Click the button below to choose a new password:</p>
      <p style="font-size: 12px; color: #94a3b8;">This password reset link will expire in <strong>15 minutes</strong> and can only be used once.</p>
    `;

    const bodyText = `${greeting}\n\nWe received a request to reset your CA Career OS password.\nClick the link below to set a new password:\n${resetLink}\n\nThis link is valid for 15 minutes. If you did not request a password reset, you can safely ignore this email.`;

    const html = this.renderBaseTemplate(
      'Reset Your Password — CA Career OS',
      bodyHtml,
      { text: 'Reset Password', url: resetLink }
    );

    return await this.sendEmail({
      to,
      subject: '[CA Career OS] Reset your account password',
      html,
      text: bodyText,
    });
  }

  /**
   * 4. Support Enquiry Confirmation
   */
  async sendSupportAcknowledgement(to: string, ticketRef: string, name: string, subject: string): Promise<{ success: boolean; messageId: string }> {
    const bodyHtml = `
      <h1>Support Enquiry Received</h1>
      <p>Dear ${name},</p>
      <p>Thank you for contacting CA Career OS Support. We have received your inquiry regarding <strong>"${subject}"</strong>.</p>
      <div class="otp-box">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8;">Assigned Ticket Reference</div>
        <div style="font-size: 20px; font-weight: 700; color: #60a5fa; margin: 8px 0;">${ticketRef}</div>
        <div style="font-size: 12px; color: #94a3b8;">Estimated response time: Within 24 business hours</div>
      </div>
      <p>Our executive team is reviewing your details and will follow up shortly.</p>
    `;

    const bodyText = `Dear ${name},\n\nThank you for reaching out. We have logged your enquiry with reference ticket: ${ticketRef} regarding "${subject}".\n\nOur team will review your enquiry and respond within 24 business hours.\n\nCA Career OS Support Team`;

    const html = this.renderBaseTemplate('Support Enquiry Received — CA Career OS', bodyHtml);
    return await this.sendEmail({
      to,
      subject: `[CA Career OS] Support Request Received (${ticketRef})`,
      html,
      text: bodyText,
    });
  }

  /**
   * 5. Security Alert (New Login or Password Changed)
   */
  async sendSecurityAlert(to: string, eventTitle: string, eventDetails: string, firstName?: string): Promise<{ success: boolean; messageId: string }> {
    const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
    const bodyHtml = `
      <h1>Security Alert: ${eventTitle}</h1>
      <p>${greeting}</p>
      <p>${eventDetails}</p>
      <p style="font-size: 12px; color: #94a3b8;">Timestamp: ${new Date().toUTCString()}</p>
    `;

    const bodyText = `${greeting}\n\nSecurity Alert: ${eventTitle}\n\n${eventDetails}\n\nTimestamp: ${new Date().toUTCString()}\n\nIf this was not you, please contact security@cacareeros.com immediately.`;

    const html = this.renderBaseTemplate(`Security Alert: ${eventTitle} — CA Career OS`, bodyHtml);
    return await this.sendEmail({
      to,
      subject: `[Security Alert] ${eventTitle} — CA Career OS`,
      html,
      text: bodyText,
    });
  }
}
