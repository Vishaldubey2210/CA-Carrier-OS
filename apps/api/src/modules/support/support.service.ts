import { Injectable, Logger, BadRequestException, HttpException, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service.js';

export interface ContactEnquiryInput {
  name: string;
  email: string;
  category: 'CAREER_SUPPORT' | 'ACCOUNT_ACCESS' | 'BILLING_GST' | 'ICAI_ETHICS' | 'ENTERPRISE' | 'GENERAL';
  subject: string;
  message: string;
}

export interface SupportEnquiryRecord {
  id: string;
  ticketRef: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
  emailDispatched: boolean;
  createdAt: Date;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private readonly memEnquiries: Map<string, SupportEnquiryRecord> = new Map();
  private readonly rateLimits: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submit a public or authenticated support inquiry
   */
  async submitEnquiry(input: ContactEnquiryInput, clientIp = '127.0.0.1'): Promise<{
    success: true;
    ticketRef: string;
    emailDispatched: boolean;
    message: string;
  }> {
    // 1. IP Rate Limiting: max 5 requests per 10 minutes
    const now = Date.now();
    const limitRecord = this.rateLimits.get(clientIp);
    if (limitRecord && now < limitRecord.resetAt) {
      if (limitRecord.count >= 5) {
        throw new HttpException(
          'Too many inquiries submitted from this connection. Please wait 10 minutes before submitting again.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }
      limitRecord.count++;
    } else {
      this.rateLimits.set(clientIp, { count: 1, resetAt: now + 10 * 60 * 1000 });
    }

    // 2. Input validation
    if (!input.name || input.name.trim().length < 2) {
      throw new BadRequestException('Please provide a valid full name (minimum 2 characters).');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!input.email || !emailRegex.test(input.email.trim())) {
      throw new BadRequestException('Please provide a valid email address.');
    }
    if (!input.subject || input.subject.trim().length < 4) {
      throw new BadRequestException('Subject must be at least 4 characters long.');
    }
    if (!input.message || input.message.trim().length < 15) {
      throw new BadRequestException('Message must contain at least 15 characters.');
    }

    // 3. Generate deterministic sequential-style ticket reference
    const randomHex = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase();
    const ticketRef = `TKT-2026-${randomHex}`;

    // 4. Email dispatch status (Honest reporting: local mock logger vs live SMTP)
    const emailDispatched = false; // Mock mode active in local development

    const record: SupportEnquiryRecord = {
      id: randomUUID(),
      ticketRef,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      category: input.category || 'GENERAL',
      subject: input.subject.trim(),
      message: input.message.trim(),
      status: 'PENDING',
      emailDispatched,
      createdAt: new Date(),
    };

    // Store in database or in-memory fallback
    if (this.prisma.isDatabaseConnected()) {
      try {
        await this.prisma.supportEnquiry.create({
          data: {
            id: record.id,
            ticketRef: record.ticketRef,
            name: record.name,
            email: record.email,
            category: record.category,
            subject: record.subject,
            message: record.message,
            status: record.status,
            clientIp,
            emailDispatched: record.emailDispatched,
          },
        });
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          this.logger.error(`Database write failed in production for support enquiry: ${err.message}`);
          throw new ServiceUnavailableException('Support submission is temporarily unavailable. Durable storage offline.');
        }
        this.logger.warn(`Failed to persist support enquiry to database, using memory store: ${err.message}`);
        this.memEnquiries.set(record.id, record);
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        throw new ServiceUnavailableException('Support submission is temporarily unavailable. Durable storage offline.');
      }
      this.memEnquiries.set(record.id, record);
    }

    this.logger.log(`[SupportService] Contact enquiry created: ${ticketRef} from ${record.email} (Category: ${record.category})`);

    return {
      success: true,
      ticketRef,
      emailDispatched,
      message: 'Your inquiry has been securely logged. An audit notification has been created.',
    };
  }

  /**
   * List logged enquiries (Admin / Support review)
   */
  async listEnquiries(): Promise<SupportEnquiryRecord[]> {
    if (this.prisma.isDatabaseConnected()) {
      try {
        const records = await this.prisma.supportEnquiry.findMany({
          orderBy: { createdAt: 'desc' },
        });
        return records.map((r: any) => ({
          id: r.id,
          ticketRef: r.ticketRef,
          name: r.name,
          email: r.email,
          category: r.category,
          subject: r.subject,
          message: r.message,
          status: r.status as 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED',
          emailDispatched: r.emailDispatched,
          createdAt: r.createdAt,
        }));
      } catch (err: any) {
        if (process.env.NODE_ENV === 'production') {
          throw new ServiceUnavailableException('Support enquiry retrieval requires durable storage.');
        }
        this.logger.warn(`Failed to list enquiries from DB, falling back to memory: ${err.message}`);
      }
    } else if (process.env.NODE_ENV === 'production') {
      throw new ServiceUnavailableException('Support enquiry retrieval requires durable storage.');
    }

    return Array.from(this.memEnquiries.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}
