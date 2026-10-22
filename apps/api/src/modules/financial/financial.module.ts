import { Module } from '@nestjs/common';
import { FinancialController } from './financial.controller.js';
import { FinancialService } from './financial.service.js';

@Module({
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService],
})
export class FinancialModule {}
