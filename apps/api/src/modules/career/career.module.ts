import { Module } from '@nestjs/common';
import { CareerController } from './career.controller.js';
import { CareerService } from './career.service.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';

@Module({
  imports: [WorkspaceModule],
  controllers: [CareerController],
  providers: [CareerService],
  exports: [CareerService],
})
export class CareerModule {}
