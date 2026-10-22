import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import crypto from 'node:crypto';
import {
  PlanTier,
  SubscriptionStatus,
  PlanDetail,
  SubscriptionDetail,
  CheckoutSessionResult,
  PaymentTransactionDetail,
  InvoiceRecordDetail,
  EntitlementCheckResult,
  InitiateCheckoutInputType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { RazorpayService } from './razorpay.service.js';
import { CURATED_PLANS } from './plans.data.js';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  // In-memory fallback stores for deterministic test execution & offline development
  private readonly memSubscriptions = new Map<string, SubscriptionDetail>(); // workspaceId -> SubscriptionDetail
  private readonly memTransactions = new Map<string, PaymentTransactionDetail>(); // transactionId -> PaymentTransactionDetail
  private readonly memInvoices = new Map<string, InvoiceRecordDetail>(); // invoiceId -> InvoiceRecordDetail
  private readonly memProcessedEvents = new Set<string>(); // set of eventId for webhook idempotency

  constructor(
    private readonly prisma: PrismaService,
    private readonly razorpayService: RazorpayService
  ) {}

  // =========================================================================
  // 1. Subscription Plans & Entitlements
  // =========================================================================

  getPlans(): PlanDetail[] {
    return CURATED_PLANS;
  }

  getPlanByTier(tier: PlanTier): PlanDetail {
    const plan = CURATED_PLANS.find((p) => p.tier === tier);
    if (!plan) {
      throw new NotFoundException(`Plan tier ${tier} not found`);
    }
    return plan;
  }

  /**
   * Retrieve current workspace subscription state with automatic grace-period and expiry reconciliation.
   */
  async getSubscription(workspaceId: string): Promise<SubscriptionDetail> {
    let sub = this.memSubscriptions.get(workspaceId);

    if (!sub) {
      sub = {
        id: crypto.randomUUID(),
        workspaceId,
        planTier: 'FREE_CANDIDATE',
        status: 'ACTIVE',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: null,
        validUntil: null,
        cancelAtPeriodEnd: false,
        gracePeriodEnd: null,
        razorpaySubscriptionId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.memSubscriptions.set(workspaceId, sub);
    }

    // Reconcile Grace Period and Expiration
    const now = Date.now();
    if (sub.status === 'PAST_DUE' && sub.gracePeriodEnd) {
      const graceEnd = new Date(sub.gracePeriodEnd).getTime();
      if (now > graceEnd) {
        this.logger.warn(`Workspace ${workspaceId} grace period expired. Downgrading to FREE_CANDIDATE.`);
        sub.status = 'EXPIRED';
        sub.planTier = 'FREE_CANDIDATE';
        sub.updatedAt = new Date().toISOString();
      }
    }

    if (sub.cancelAtPeriodEnd && sub.currentPeriodEnd) {
      const periodEnd = new Date(sub.currentPeriodEnd).getTime();
      if (now > periodEnd) {
        this.logger.log(`Workspace ${workspaceId} period elapsed after cancellation. Downgrading to FREE_CANDIDATE.`);
        sub.status = 'ACTIVE';
        sub.planTier = 'FREE_CANDIDATE';
        sub.cancelAtPeriodEnd = false;
        sub.updatedAt = new Date().toISOString();
      }
    }

    return sub;
  }

  // =========================================================================
  // 2. Checkout Initiation (Razorpay Order in Paise)
  // =========================================================================

  async initiateCheckout(
    workspaceId: string,
    userId: string,
    input: InitiateCheckoutInputType,
    customerEmail?: string
  ): Promise<CheckoutSessionResult> {
    const plan = this.getPlanByTier(input.planTier);

    const isAnnual = input.billingCycle === 'ANNUAL';
    const amountInr = isAnnual ? plan.priceInrAnnual : plan.priceInrMonthly;
    const amountPaise = amountInr * 100;

    const receipt = `rcpt_${workspaceId.slice(0, 8)}_${Date.now()}`;
    const order = await this.razorpayService.createOrder({
      amountPaise,
      currency: 'INR',
      receipt,
      notes: {
        workspaceId,
        userId,
        planTier: input.planTier,
        billingCycle: input.billingCycle,
        b2bGstin: input.b2bGstin || '',
      },
    });

    const transactionId = crypto.randomUUID();
    const transaction: PaymentTransactionDetail = {
      id: transactionId,
      subscriptionId: (await this.getSubscription(workspaceId)).id,
      workspaceId,
      amountInr,
      currency: 'INR',
      paymentMethod: 'UPI',
      razorpayPaymentId: null,
      razorpayOrderId: order.id,
      status: 'PENDING',
      errorMessage: null,
      createdAt: new Date().toISOString(),
    };
    this.memTransactions.set(transactionId, transaction);

    return {
      orderId: order.id,
      keyId: this.razorpayService.getKeyId(),
      amountPaise,
      currency: 'INR',
      planTier: input.planTier,
      billingCycle: input.billingCycle,
      customerEmail: customerEmail || 'user@cacareeros.com',
    };
  }

  // =========================================================================
  // 3. Webhook Signature Verification & Idempotent Processing
  // =========================================================================

  async processWebhook(
    rawBody: string,
    signature: string,
    payload: any
  ): Promise<{ status: string; eventId: string; actionTaken: string }> {
    // 1. HMAC-SHA256 Timing-Safe Signature Verification
    const isValid = this.razorpayService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      throw new UnauthorizedException('Invalid Razorpay webhook signature');
    }

    const eventId = payload.event_id || payload.id || `evt_${crypto.randomUUID()}`;
    const eventType = payload.event;

    // 2. Deterministic Idempotency Guard: Deduplicate repeated webhooks
    if (this.memProcessedEvents.has(eventId)) {
      this.logger.warn(`Idempotency hit: Webhook event ${eventId} already processed. Skipping duplicate execution.`);
      return { status: 'IGNORED', eventId, actionTaken: 'ALREADY_PROCESSED' };
    }

    this.memProcessedEvents.add(eventId);

    // 3. Event Processing
    let actionTaken = 'NONE';
    const paymentEntity = payload.payload?.payment?.entity;
    const notes = paymentEntity?.notes || payload.notes || {};
    const workspaceId = notes.workspaceId;

    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      if (workspaceId) {
        const sub = await this.getSubscription(workspaceId);
        const targetTier = (notes.planTier as PlanTier) || 'PRO_CANDIDATE';
        const isAnnual = notes.billingCycle === 'ANNUAL';
        const durationDays = isAnnual ? 365 : 30;

        sub.planTier = targetTier;
        sub.status = 'ACTIVE';
        sub.currentPeriodStart = new Date().toISOString();
        sub.currentPeriodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
        sub.validUntil = sub.currentPeriodEnd;
        sub.cancelAtPeriodEnd = false;
        sub.gracePeriodEnd = null;
        sub.updatedAt = new Date().toISOString();

        // Generate GST-compliant Tax Invoice (SAC 998314)
        const plan = this.getPlanByTier(targetTier);
        const subtotal = isAnnual ? plan.priceInrAnnual : plan.priceInrMonthly;
        const gstAmount = Math.round(subtotal * 0.18);
        const totalAmount = subtotal + gstAmount;

        const invoiceId = crypto.randomUUID();
        const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const invoice: InvoiceRecordDetail = {
          id: invoiceId,
          subscriptionId: sub.id,
          workspaceId,
          invoiceNumber,
          sacCode: '998314',
          subtotalInr: subtotal,
          gstRatePct: 18,
          gstAmountInr: gstAmount,
          totalAmountInr: totalAmount,
          b2bGstin: notes.b2bGstin || null,
          issuedAt: new Date().toISOString(),
          status: 'PAID',
        };
        this.memInvoices.set(invoiceId, invoice);

        actionTaken = `SUBSCRIPTION_ACTIVATED_${targetTier}`;
        this.logger.log(`Subscription for workspace ${workspaceId} upgraded to ${targetTier} via webhook ${eventId}`);
      }
    } else if (eventType === 'payment.failed') {
      if (workspaceId) {
        const sub = await this.getSubscription(workspaceId);
        sub.status = 'PAST_DUE';
        // 7-day grace window
        sub.gracePeriodEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        sub.updatedAt = new Date().toISOString();
        actionTaken = 'GRACE_PERIOD_STARTED';
        this.logger.warn(`Payment failed for workspace ${workspaceId}. 7-day grace period initiated.`);
      }
    } else if (eventType === 'subscription.cancelled') {
      if (workspaceId) {
        const sub = await this.getSubscription(workspaceId);
        sub.cancelAtPeriodEnd = true;
        sub.updatedAt = new Date().toISOString();
        actionTaken = 'SCHEDULED_CANCEL_AT_PERIOD_END';
      }
    }

    return { status: 'PROCESSED', eventId, actionTaken };
  }

  // =========================================================================
  // 4. Subscription Management (Cancel / Reactivate)
  // =========================================================================

  async cancelSubscription(workspaceId: string, reason?: string): Promise<SubscriptionDetail> {
    const sub = await this.getSubscription(workspaceId);
    if (sub.planTier === 'FREE_CANDIDATE') {
      throw new BadRequestException('Free tier does not require cancellation');
    }

    sub.cancelAtPeriodEnd = true;
    sub.updatedAt = new Date().toISOString();
    this.logger.log(`Workspace ${workspaceId} requested cancellation (Reason: ${reason || 'Not provided'})`);
    return sub;
  }

  async reactivateSubscription(workspaceId: string): Promise<SubscriptionDetail> {
    const sub = await this.getSubscription(workspaceId);
    if (!sub.cancelAtPeriodEnd) {
      throw new BadRequestException('Subscription is not pending cancellation');
    }

    sub.cancelAtPeriodEnd = false;
    sub.updatedAt = new Date().toISOString();
    this.logger.log(`Workspace ${workspaceId} reactivated subscription`);
    return sub;
  }

  // =========================================================================
  // 5. Invoicing & In-Memory Records
  // =========================================================================

  async getInvoices(workspaceId: string): Promise<InvoiceRecordDetail[]> {
    return Array.from(this.memInvoices.values()).filter((inv) => inv.workspaceId === workspaceId);
  }

  // =========================================================================
  // 6. Backend Entitlement Enforcement
  // =========================================================================

  /**
   * Enforce feature access on the backend.
   * Client-side UI state modification cannot bypass this check.
   */
  async checkEntitlement(
    workspaceId: string,
    featureKey: 'UNLIMITED_RESUMES' | 'UNLIMITED_INTERVIEWS' | 'JOB_POSTING' | 'PRACTICE_CRM',
    currentUsage = 0
  ): Promise<EntitlementCheckResult> {
    const sub = await this.getSubscription(workspaceId);
    const plan = this.getPlanByTier(sub.planTier);

    if (featureKey === 'UNLIMITED_RESUMES') {
      if (plan.monthlyResumeLimit === -1) {
        return { allowed: true, tier: sub.planTier, featureKey };
      }
      const allowed = currentUsage < plan.monthlyResumeLimit;
      return {
        allowed,
        tier: sub.planTier,
        featureKey,
        currentUsage,
        maxLimit: plan.monthlyResumeLimit,
        message: allowed
          ? 'Within free monthly limit'
          : `Monthly free resume limit reached (${plan.monthlyResumeLimit}). Upgrade to Pro Candidate Pass for unlimited tailoring.`,
      };
    }

    if (featureKey === 'UNLIMITED_INTERVIEWS') {
      if (plan.monthlyInterviewLimit === -1) {
        return { allowed: true, tier: sub.planTier, featureKey };
      }
      const allowed = currentUsage < plan.monthlyInterviewLimit;
      return {
        allowed,
        tier: sub.planTier,
        featureKey,
        currentUsage,
        maxLimit: plan.monthlyInterviewLimit,
        message: allowed
          ? 'Within free monthly mock interview limit'
          : `Monthly free mock interview limit reached (${plan.monthlyInterviewLimit}). Upgrade to Pro for unlimited simulations.`,
      };
    }

    if (featureKey === 'JOB_POSTING') {
      const allowed = plan.maxActiveJobs > 0 && currentUsage < plan.maxActiveJobs;
      return {
        allowed,
        tier: sub.planTier,
        featureKey,
        currentUsage,
        maxLimit: plan.maxActiveJobs,
        message: allowed
          ? 'Job publishing allowed'
          : `Job posting requires an Employer Team Plan (Max ${plan.maxActiveJobs} active jobs).`,
      };
    }

    if (featureKey === 'PRACTICE_CRM') {
      const allowed = plan.crmAccess || sub.planTier === 'PRACTICE_CRM';
      return {
        allowed,
        tier: sub.planTier,
        featureKey,
        message: allowed
          ? 'Practice CRM access active'
          : 'Practice CRM module requires Practice Management OS subscription.',
      };
    }

    return { allowed: true, tier: sub.planTier, featureKey };
  }
}
