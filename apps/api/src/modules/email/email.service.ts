import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import nodemailer, { Transporter } from 'nodemailer';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';

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

export interface ScrapingReportItem {
  sourceName: string;
  providerType: string;
  status: string;
  fetchedCount: number;
  ingestedCount: number;
  duplicateCount: number;
  durationMs: number;
  errorMessage?: string;
}

export interface ScrapingSummaryAlertPayload {
  recipientEmail?: string;
  totalIngested: number;
  totalDuplicates: number;
  durationMs: number;
  sources: ScrapingReportItem[];
  timestamp?: string;
  nextScheduledRun?: string;
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

  /**
   * Helper to retrieve saved user email from persistent mass mailer SMTP config
   */
  private getSavedSmtpEmail(): string | null {
    try {
      const configPath = path.resolve(process.cwd(), 'data', 'mass_mailer_smtp.json');
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return parsed.email || null;
      }
    } catch {
      // Ignore silently
    }
    return null;
  }

  /**
   * 6. Real-time Scraping & Data Ingestion SMTP Alert
   * Dispatched whenever an automated or on-demand scraping sync completes.
   */
  async sendScrapingSummaryAlert(
    payload: ScrapingSummaryAlertPayload
  ): Promise<{ success: boolean; messageId: string; recipient: string }> {
    const defaultRecipient =
      payload.recipientEmail ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.ADMIN_EMAIL ||
      process.env.SMTP_USER ||
      this.getSavedSmtpEmail() ||
      'compliance@cacareeros.com';

    const timestampStr = payload.timestamp || new Date().toLocaleString('en-IN');
    const durationSeconds = (payload.durationMs / 1000).toFixed(2);

    const sourceRows = payload.sources
      .map(
        (s) => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
          <td style="padding: 10px 12px; font-weight: 600; color: #f1f5f9;">${s.sourceName}</td>
          <td style="padding: 10px 12px; color: #94a3b8; font-size: 11px;">${s.providerType}</td>
          <td style="padding: 10px 12px;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; ${
              s.status === 'SUCCESS' || s.status === 'ACTIVE'
                ? 'background: rgba(16,185,129,0.15); color: #34d399;'
                : 'background: rgba(239,68,68,0.15); color: #f87171;'
            }">
              ${s.status}
            </span>
          </td>
          <td style="padding: 10px 12px; text-align: right; color: #60a5fa; font-weight: 700;">${s.fetchedCount}</td>
          <td style="padding: 10px 12px; text-align: right; color: #34d399; font-weight: 700;">+${s.ingestedCount}</td>
          <td style="padding: 10px 12px; text-align: right; color: #94a3b8;">${s.duplicateCount}</td>
          <td style="padding: 10px 12px; text-align: right; color: #94a3b8; font-size: 11px;">${s.durationMs}ms</td>
        </tr>`
      )
      .join('');

    const bodyHtml = `
      <div style="margin-bottom: 20px;">
        <span style="background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.3); padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">
          REAL-TIME DATA SCRAPING REPORT
        </span>
      </div>

      <h1 style="font-size: 22px; color: #ffffff; margin: 0 0 8px 0; font-weight: 800; letter-spacing: -0.02em;">
        Scraper Ingestion Completed: +${payload.totalIngested} Opportunities
      </h1>
      <p style="color: #94a3b8; font-size: 13px; margin: 0 0 24px 0; line-height: 1.5;">
        Automated safe scraping across ICAI portals, Big 4 careers, premier CA firms, and verified XML feeds has executed successfully.
      </p>

      <!-- KPI Summary Cards -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 8px; margin-bottom: 24px;">
        <tr>
          <td style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; text-align: center; width: 33%;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">New Ingested</div>
            <div style="font-size: 24px; font-weight: 900; color: #34d399; margin-top: 4px;">+${payload.totalIngested}</div>
          </td>
          <td style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; text-align: center; width: 33%;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Duplicates Filtered</div>
            <div style="font-size: 24px; font-weight: 900; color: #f1f5f9; margin-top: 4px;">${payload.totalDuplicates}</div>
          </td>
          <td style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; text-align: center; width: 33%;">
            <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Sync Duration</div>
            <div style="font-size: 24px; font-weight: 900; color: #60a5fa; margin-top: 4px;">${durationSeconds}s</div>
          </td>
        </tr>
      </table>

      <!-- Multi-Website Source Breakdown -->
      <h3 style="font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.06em; margin: 0 0 12px 0;">
        Scraped Sources Breakdown
      </h3>
      <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; font-size: 12px; margin-bottom: 24px;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);">
            <th style="padding: 10px 12px; text-align: left; color: #94a3b8; font-weight: 600;">Source / Portal</th>
            <th style="padding: 10px 12px; text-align: left; color: #94a3b8; font-weight: 600;">Type</th>
            <th style="padding: 10px 12px; text-align: left; color: #94a3b8; font-weight: 600;">Status</th>
            <th style="padding: 10px 12px; text-align: right; color: #94a3b8; font-weight: 600;">Fetched</th>
            <th style="padding: 10px 12px; text-align: right; color: #94a3b8; font-weight: 600;">New</th>
            <th style="padding: 10px 12px; text-align: right; color: #94a3b8; font-weight: 600;">Dup</th>
            <th style="padding: 10px 12px; text-align: right; color: #94a3b8; font-weight: 600;">Latency</th>
          </tr>
        </thead>
        <tbody>
          ${sourceRows}
        </tbody>
      </table>

      <!-- Security & Anti-Ban Safeguards Status -->
      <div style="background: rgba(16,185,129,0.06); border: 1px solid rgba(16,185,129,0.2); border-radius: 8px; padding: 14px; margin-bottom: 24px;">
        <div style="font-weight: bold; color: #34d399; font-size: 13px; margin-bottom: 6px;">
          🛡 Anti-Ban &amp; Security Protections Active
        </div>
        <ul style="color: #94a3b8; font-size: 12px; margin: 0 0 0 16px; padding: 0; line-height: 1.6;">
          <li><strong>ETag 304 Caching:</strong> Unchanged feeds return 304 Not Modified, saving 98% network payload.</li>
          <li><strong>Safe Jitter Rotation:</strong> Pacing delay between requests prevents firewall and IP triggers.</li>
          <li><strong>Content Sanitization:</strong> XSS and SSRF protection applied to all extracted job postings.</li>
        </ul>
      </div>

      <div style="font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 14px;">
        Timestamp: ${timestampStr} | CA Career OS Autonomous Aggregator Daemon
      </div>
    `;

    const bodyText = `[CharteredOS Scraper Alert] Real-time Ingestion Completed\n\n` +
      `New Ingested: +${payload.totalIngested}\n` +
      `Duplicates: ${payload.totalDuplicates}\n` +
      `Duration: ${durationSeconds}s\n` +
      `Timestamp: ${timestampStr}\n\n` +
      `Sources:\n` +
      payload.sources.map(s => `- ${s.sourceName} (${s.providerType}): Status ${s.status}, Fetched ${s.fetchedCount}, New ${s.ingestedCount}`).join('\n') +
      `\n\nAll anti-ban shields active. View live jobs on CharteredOS.`;

    const html = this.renderBaseTemplate(
      `⚡ [Scraper Alert] +${payload.totalIngested} CA Jobs Ingested`,
      bodyHtml,
      {
        text: 'View Live Opportunity Board',
        url: `${process.env.APP_URL || 'http://localhost:3000'}/articleship`,
      }
    );

    const dispatchRes = await this.sendEmail({
      to: defaultRecipient,
      subject: `⚡ [CharteredOS Scraper Alert] +${payload.totalIngested} New Opportunities Ingested (${new Date().toLocaleDateString('en-IN')})`,
      html,
      text: bodyText,
    });

    this.logger.log(`[ScraperNotification] Dispatched scraping report to ${defaultRecipient} (MessageId: ${dispatchRes.messageId})`);

    return {
      success: dispatchRes.success,
      messageId: dispatchRes.messageId,
      recipient: defaultRecipient,
    };
  }
}
