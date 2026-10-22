import { Module } from '@nestjs/common';
import { CommunityController } from './community.controller.js';
import { CommunityService } from './community.service.js';

@Module({
  controllers: [CommunityController],
  providers: [CommunityService],
  exports: [CommunityService],
})
export class CommunityModule {}
