import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller.js';
import { AgentOrchestratorService } from './agent-orchestrator.service.js';
import { ApprovalsService } from './approvals.service.js';
import { AgentToolsRegistry } from './agent-tools.registry.js';
import { CareerModule } from '../career/career.module.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { ApplicationsModule } from '../applications/applications.module.js';
import { ResumesModule } from '../resumes/resumes.module.js';
import { InterviewsModule } from '../interviews/interviews.module.js';

@Module({
  imports: [
    CareerModule,
    JobsModule,
    ApplicationsModule,
    ResumesModule,
    InterviewsModule,
  ],
  controllers: [AgentController],
  providers: [
    AgentToolsRegistry,
    ApprovalsService,
    AgentOrchestratorService,
  ],
  exports: [
    AgentToolsRegistry,
    ApprovalsService,
    AgentOrchestratorService,
  ],
})
export class AgentModule {}
