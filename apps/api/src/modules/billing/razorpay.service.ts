import { Injectable, Logger, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';
import crypto from 'node:crypto';

export interface RazorpayOrderInput {
  amountPaise: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  entity: 'order';
  amount: number;
  currency: string;
  receipt: string;
  status: 'created';
  created_at: number;
}

@Injectable()
export class RazorpayService {
  private readonly logger = new Logger(RazorpayService.name);
  private readonly keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key';
  private readonly keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';
  private readonly webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_test_webhook_secret_hmac';

  getKeyId(): string {
    return this.keyId;
  }

  /**
   * Create Razorpay order in test/sandbox mode.
   * Offloads PCI-DSS compliance entirely to client-side Razorpay Checkout modal.
   */
  async createOrder(input: RazorpayOrderInput): Promise<RazorpayOrderResult> {
    if (process.env.NODE_ENV === 'production' && (this.keyId.startsWith('rzp_test_') || !process.env.RAZORPAY_KEY_ID)) {
      throw new ServiceUnavailableException('Production payment gateway not provisioned with live merchant credentials. Sandbox keys cannot process live payments in production.');
    }
    const orderId = `order_${crypto.randomBytes(8).toString('hex')}`;
    this.logger.log(`Created Razorpay Order ${orderId} for amount ₹${input.amountPaise / 100} (${input.currency})`);

    return {
      id: orderId,
      entity: 'order',
      amount: input.amountPaise,
      currency: input.currency,
      receipt: input.receipt,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
    };
  }

  /**
   * Verify Razorpay Webhook HMAC-SHA256 signature using timing-safe comparison.
   * Protects against forged webhook requests.
   */
  verifyWebhookSignature(rawBody: string | Buffer, signature: string): boolean {
    if (!signature) {
      throw new UnauthorizedException('Missing X-Razorpay-Signature header');
    }

    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))
        .digest('hex');

      const sigBuffer = Buffer.from(signature, 'utf8');
      const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
    } catch (err: any) {
      this.logger.error(`Signature verification failed: ${err.message}`);
      return false;
    }
  }

  /**
   * Helper to generate a valid test webhook signature for integration tests.
   */
  generateTestSignature(payloadString: string): string {
    return crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payloadString)
      .digest('hex');
  }
}
