import { Module } from '@nestjs/common';
import { InterviewsController } from './interviews.controller.js';
import { InterviewsService } from './interviews.service.js';
import { CareerModule } from '../career/career.module.js';

@Module({
  imports: [CareerModule],
  controllers: [InterviewsController],
  providers: [InterviewsService],
  exports: [InterviewsService],
})
export class InterviewsModule {}
