import { Module } from '@nestjs/common';
import { MassMailingController } from './mass-mailing.controller.js';
import { MassMailingService } from './mass-mailing.service.js';

@Module({
  controllers: [MassMailingController],
  providers: [MassMailingService],
  exports: [MassMailingService],
})
export class MassMailingModule {}
