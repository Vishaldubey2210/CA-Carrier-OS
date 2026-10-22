import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { PrismaModule } from './modules/prisma/prisma.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware.js';

import { AuthModule } from './modules/auth/auth.module.js';
import { WorkspaceModule } from './modules/workspace/workspace.module.js';
import { CareerModule } from './modules/career/career.module.js';
import { JobsModule } from './modules/jobs/jobs.module.js';
import { ApplicationsModule } from './modules/applications/applications.module.js';
import { ResumesModule } from './modules/resumes/resumes.module.js';
import { InterviewsModule } from './modules/interviews/interviews.module.js';
import { AgentModule } from './modules/agent/agent.module.js';
import { FinancialModule } from './modules/financial/financial.module.js';
import { MentorshipModule } from './modules/mentorship/mentorship.module.js';
import { CommunityModule } from './modules/community/community.module.js';
import { PracticeModule } from './modules/practice/practice.module.js';
import { RecruitmentModule } from './modules/recruitment/recruitment.module.js';
import { BillingModule } from './modules/billing/billing.module.js';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    AuthModule,
    WorkspaceModule,
    CareerModule,
    JobsModule,
    ApplicationsModule,
    ResumesModule,
    InterviewsModule,
    AgentModule,
    FinancialModule,
    MentorshipModule,
    CommunityModule,
    PracticeModule,
    RecruitmentModule,
    BillingModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
