import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { AnnotationsController } from './annotations.controller.js';
import { AnnotationsService } from './annotations.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [AnnotationsController],
  providers: [AnnotationsService],
  exports: [AnnotationsService],
})
export class AnnotationsModule {}
