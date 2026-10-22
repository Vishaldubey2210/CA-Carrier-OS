import { Module } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service.js';
import { RecruitmentController } from './recruitment.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
