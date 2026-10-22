import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Headers,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  InitiateCheckoutSchema,
  CancelSubscriptionSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { BillingService } from './billing.service.js';

@Controller('api/v1/billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  /**
   * List available subscription plans and entitlements
   */
  @Get('plans')
  getPlans() {
    const plans = this.billingService.getPlans();
    return createSuccessResponse(plans);
  }

  /**
   * Retrieve active workspace subscription state
   */
  @Get('subscription')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async getSubscription(@CurrentWorkspace() workspace: any) {
    const sub = await this.billingService.getSubscription(workspace.id);
    return createSuccessResponse(sub);
  }

  /**
   * Initiate Razorpay checkout order for plan upgrade
   */
  @Post('checkout')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async initiateCheckout(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parse = InitiateCheckoutSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid checkout parameters',
        errors: parse.error.errors,
      });
    }

    const session = await this.billingService.initiateCheckout(
      workspace.id,
      user.id,
      parse.data,
      user.email
    );
    return createSuccessResponse(session);
  }

  /**
   * Signature-verified Razorpay Webhook receiver with idempotent deduplication
   */
  @Post('webhooks/razorpay')
  async handleRazorpayWebhook(
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any
  ) {
    const rawBody = typeof body === 'string' ? body : JSON.stringify(body);
    const result = await this.billingService.processWebhook(rawBody, signature, body);
    return createSuccessResponse(result);
  }

  /**
   * Cancel subscription at period end
   */
  @Post('cancel')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async cancelSubscription(
    @Body() body: unknown,
    @CurrentWorkspace() workspace: any
  ) {
    const parse = CancelSubscriptionSchema.safeParse(body);
    const reason = parse.success ? parse.data.reason : undefined;

    const sub = await this.billingService.cancelSubscription(workspace.id, reason);
    return createSuccessResponse(sub);
  }

  /**
   * Reactivate subscription before period end
   */
  @Post('reactivate')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async reactivateSubscription(@CurrentWorkspace() workspace: any) {
    const sub = await this.billingService.reactivateSubscription(workspace.id);
    return createSuccessResponse(sub);
  }

  /**
   * List tax invoices for current workspace
   */
  @Get('invoices')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async getInvoices(@CurrentWorkspace() workspace: any) {
    const invoices = await this.billingService.getInvoices(workspace.id);
    return createSuccessResponse(invoices);
  }

  /**
   * Check feature entitlement on backend
   */
  @Get('entitlements/:featureKey')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async checkEntitlement(
    @Param('featureKey') featureKey: any,
    @Query('usage') usage: string,
    @CurrentWorkspace() workspace: any
  ) {
    const currentUsage = usage ? parseInt(usage, 10) : 0;
    const check = await this.billingService.checkEntitlement(workspace.id, featureKey, currentUsage);
    return createSuccessResponse(check);
  }
}
