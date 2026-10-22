import { Module } from '@nestjs/common';
import { MentorshipController } from './mentorship.controller.js';
import { MentorshipService } from './mentorship.service.js';

@Module({
  controllers: [MentorshipController],
  providers: [MentorshipService],
  exports: [MentorshipService],
})
export class MentorshipModule {}
