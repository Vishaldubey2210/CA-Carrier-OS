import { Module } from '@nestjs/common';
import { PracticeService } from './practice.service.js';
import { PracticeController } from './practice.controller.js';
import { PrismaModule } from '../prisma/prisma.module.js';

@Module({
  imports: [PrismaModule],
  controllers: [PracticeController],
  providers: [PracticeService],
  exports: [PracticeService],
})
export class PracticeModule {}
