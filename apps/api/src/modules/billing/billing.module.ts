import { Module } from '@nestjs/common';
import { BillingService } from './billing.service.js';
import { BillingController } from './billing.controller.js';
import { RazorpayService } from './razorpay.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [BillingController],
  providers: [BillingService, RazorpayService],
  exports: [BillingService, RazorpayService],
})
export class BillingModule {}
