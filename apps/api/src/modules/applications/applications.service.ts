import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ApplicationRecord,
  ApplicationStatus,
  ApplicationStatusHistoryItem,
  CreateApplicationInputType,
  CreateFollowUpTaskInputType,
  FollowUpTaskItem,
  UpdateApplicationStatusInputType,
  WorkspaceType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { JobsService } from '../jobs/jobs.service.js';

// Valid forward and terminal transitions mapping
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.SAVED]: [
    ApplicationStatus.PLANNED,
    ApplicationStatus.TAILORED,
    ApplicationStatus.APPLIED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.PLANNED]: [
    ApplicationStatus.TAILORED,
    ApplicationStatus.APPLIED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.TAILORED]: [
    ApplicationStatus.APPLIED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.APPLIED]: [
    ApplicationStatus.ACKNOWLEDGED,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEWING,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.ACKNOWLEDGED]: [
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.INTERVIEWING,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.SHORTLISTED]: [
    ApplicationStatus.INTERVIEWING,
    ApplicationStatus.OFFERED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.INTERVIEWING]: [
    ApplicationStatus.OFFERED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.OFFERED]: [
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
    ApplicationStatus.WITHDRAWN,
  ],
  [ApplicationStatus.ACCEPTED]: [],
  [ApplicationStatus.REJECTED]: [
    ApplicationStatus.APPLIED, // Candidate re-applies in future cycle
  ],
  [ApplicationStatus.WITHDRAWN]: [
    ApplicationStatus.APPLIED, // Candidate re-activates
  ],
};

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  // In-memory fallback stores: applicationId -> ApplicationRecord
  private readonly memApplications = new Map<string, ApplicationRecord>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService
  ) {}

  /**
   * List candidate applications in authorized personal workspace.
   */
  async listApplications(userId: string, workspaceId: string): Promise<ApplicationRecord[]> {
    const apps = Array.from(this.memApplications.values()).filter(
      app => app.candidateProfileId === userId
    );
    return apps.sort(
      (a, b) => new Date(b.statusUpdatedAt).getTime() - new Date(a.statusUpdatedAt).getTime()
    );
  }

  /**
   * Create new job application tracking record.
   */
  async createApplication(
    input: CreateApplicationInputType,
    userId: string,
    workspaceId: string
  ): Promise<ApplicationRecord> {
    const job = await this.jobsService.getJobById(input.jobId);

    const now = new Date().toISOString();
    const initialStatus = input.status || ApplicationStatus.SAVED;
    const appId = randomUUID();

    const historyItem: ApplicationStatusHistoryItem = {
      id: randomUUID(),
      applicationId: appId,
      fromStatus: null,
      toStatus: initialStatus,
      notes: 'Application tracking record created',
      changedAt: now,
    };

    const followUps: FollowUpTaskItem[] = [];
    if (input.nextFollowUpDate) {
      followUps.push({
        id: randomUUID(),
        applicationId: appId,
        title: `Follow up with recruiter regarding ${job.title}`,
        dueDate: input.nextFollowUpDate,
        completed: false,
        createdAt: now,
      });
    }

    if (this.prisma.isDatabaseConnected()) {
      let profileId = userId;
      const dbProfile = await this.prisma.candidateProfile.findFirst({
        where: { OR: [{ id: userId }, { userId }] },
      });
      if (dbProfile) profileId = dbProfile.id;

      const dbApp = await this.prisma.application.create({
        data: {
          id: appId,
          candidateProfileId: profileId,
          jobId: input.jobId,
          status: initialStatus as any,
          coverNote: input.coverNote || null,
          nextFollowUpDate: input.nextFollowUpDate ? new Date(input.nextFollowUpDate) : null,
          appliedAt: initialStatus === ApplicationStatus.APPLIED ? new Date() : null,
          statusHistory: {
            create: {
              id: randomUUID(),
              fromStatus: null,
              toStatus: initialStatus as any,
              notes: 'Application tracking record created',
            },
          },
        },
      });

      this.logger.log(`Created application tracking record ${dbApp.id} in DB for job ${job.title}`);
      return {
        id: dbApp.id,
        candidateProfileId: dbApp.candidateProfileId,
        jobId: dbApp.jobId,
        job,
        resumeVersionId: dbApp.resumeVersionId,
        status: dbApp.status as unknown as ApplicationStatus,
        coverNote: dbApp.coverNote,
        recruiterContact: (dbApp.recruiterContact as any) || {},
        appliedAt: dbApp.appliedAt ? dbApp.appliedAt.toISOString() : null,
        statusUpdatedAt: dbApp.statusUpdatedAt.toISOString(),
        nextFollowUpDate: dbApp.nextFollowUpDate ? dbApp.nextFollowUpDate.toISOString() : null,
        history: [historyItem],
        followUps,
      };
    }

    const newApp: ApplicationRecord = {
      id: appId,
      candidateProfileId: userId,
      jobId: input.jobId,
      job,
      resumeVersionId: input.resumeVersionId || null,
      status: initialStatus,
      coverNote: input.coverNote || null,
      recruiterContact: input.recruiterContact,
      appliedAt: initialStatus === ApplicationStatus.APPLIED ? now : null,
      statusUpdatedAt: now,
      nextFollowUpDate: input.nextFollowUpDate || null,
      history: [historyItem],
      followUps,
    };

    this.memApplications.set(appId, newApp);
    this.logger.log(`Created application tracking record ${appId} for job ${job.title}`);
    return newApp;
  }

  /**
   * Get single application detail with status history and follow-ups.
   */
  async getApplicationById(
    applicationId: string,
    userId: string
  ): Promise<ApplicationRecord> {
    if (this.prisma.isDatabaseConnected()) {
      const dbApp = await this.prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          job: true,
          statusHistory: { orderBy: { changedAt: 'desc' } },
          followUps: { orderBy: { createdAt: 'desc' } },
        },
      });
      if (!dbApp) {
        throw new NotFoundException(`Application with ID ${applicationId} not found`);
      }

      const dbProfile = await this.prisma.candidateProfile.findFirst({
        where: { OR: [{ id: userId }, { userId }] },
      });
      const validProfileId = dbProfile ? dbProfile.id : userId;
      if (dbApp.candidateProfileId !== validProfileId && dbApp.candidateProfileId !== userId) {
        throw new ForbiddenException('Access denied: You cannot view applications owned by another user');
      }

      const jobDetail: any = {
        id: dbApp.job.id,
        employerId: dbApp.job.employerId,
        title: dbApp.job.title,
        normalizedTitle: dbApp.job.normalizedTitle,
        companyName: dbApp.job.companyName,
        locationCity: dbApp.job.locationCity,
        workArrangement: dbApp.job.workArrangement,
        caPathway: dbApp.job.caPathway,
        salaryMin: dbApp.job.salaryMin,
        salaryMax: dbApp.job.salaryMax,
        salaryDisclosed: dbApp.job.salaryDisclosed,
        experienceMin: dbApp.job.experienceMin,
        experienceMax: dbApp.job.experienceMax,
        rawDescription: dbApp.job.rawDescription,
        structuredRequirements: dbApp.job.structuredRequirements,
        status: dbApp.job.status,
        source: dbApp.job.source,
        sourceUrl: dbApp.job.sourceUrl,
        isVerified: dbApp.job.isVerified,
        fingerprint: dbApp.job.fingerprint,
        postedAt: dbApp.job.postedAt.toISOString(),
        expiresAt: dbApp.job.expiresAt.toISOString(),
      };

      return {
        id: dbApp.id,
        candidateProfileId: dbApp.candidateProfileId,
        jobId: dbApp.jobId,
        job: jobDetail,
        resumeVersionId: dbApp.resumeVersionId,
        status: dbApp.status as unknown as ApplicationStatus,
        coverNote: dbApp.coverNote,
        recruiterContact: (dbApp.recruiterContact as any) || {},
        appliedAt: dbApp.appliedAt ? dbApp.appliedAt.toISOString() : null,
        statusUpdatedAt: dbApp.statusUpdatedAt.toISOString(),
        nextFollowUpDate: dbApp.nextFollowUpDate ? dbApp.nextFollowUpDate.toISOString() : null,
        history: dbApp.statusHistory.map((h) => ({
          id: h.id,
          applicationId: h.applicationId,
          fromStatus: h.fromStatus as unknown as ApplicationStatus,
          toStatus: h.toStatus as unknown as ApplicationStatus,
          notes: h.notes || '',
          changedAt: h.changedAt.toISOString(),
        })),
        followUps: dbApp.followUps.map((f) => ({
          id: f.id,
          applicationId: f.applicationId,
          title: f.title,
          dueDate: f.dueDate ? f.dueDate.toISOString() : null,
          completed: f.completed,
          createdAt: f.createdAt.toISOString(),
        })),
      };
    }

    const app = this.memApplications.get(applicationId);
    if (!app) {
      throw new NotFoundException(`Application with ID ${applicationId} not found`);
    }

    // Tenant / Ownership isolation: Candidate blindfold check
    if (app.candidateProfileId !== userId) {
      throw new ForbiddenException('Access denied: You cannot view applications owned by another user');
    }

    return app;
  }

  /**
   * Update application status with strict state transition validation.
   */
  async updateApplicationStatus(
    applicationId: string,
    input: UpdateApplicationStatusInputType,
    userId: string
  ): Promise<ApplicationRecord> {
    const app = await this.getApplicationById(applicationId, userId);

    const currentStatus = app.status;
    const targetStatus = input.status;

    if (currentStatus === targetStatus) {
      return app;
    }

    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${targetStatus}. Allowed transitions: ${allowed.join(', ') || 'None (Terminal state)'}`
      );
    }

    const now = new Date().toISOString();
    const historyItem: ApplicationStatusHistoryItem = {
      id: randomUUID(),
      applicationId: app.id,
      fromStatus: currentStatus,
      toStatus: targetStatus,
      notes: input.notes || `Status changed from ${currentStatus} to ${targetStatus}`,
      changedAt: now,
    };

    if (this.prisma.isDatabaseConnected()) {
      await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          status: targetStatus as any,
          statusUpdatedAt: new Date(),
          appliedAt: targetStatus === ApplicationStatus.APPLIED && !app.appliedAt ? new Date() : undefined,
          statusHistory: {
            create: {
              id: historyItem.id,
              fromStatus: currentStatus as any,
              toStatus: targetStatus as any,
              notes: historyItem.notes,
            },
          },
        },
      });
      return await this.getApplicationById(applicationId, userId);
    }

    app.status = targetStatus;
    app.statusUpdatedAt = now;
    if (targetStatus === ApplicationStatus.APPLIED && !app.appliedAt) {
      app.appliedAt = now;
    }
    app.history.unshift(historyItem);

    // Auto-create follow-up task on interview or offer
    if (targetStatus === ApplicationStatus.INTERVIEWING) {
      app.followUps.unshift({
        id: randomUUID(),
        applicationId: app.id,
        title: `Prepare technical and behavioral questions for ${app.job.title}`,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed: false,
        createdAt: now,
      });
    }

    this.logger.log(`Application ${app.id} transitioned from ${currentStatus} to ${targetStatus}`);
    return app;
  }

  /**
   * Add a follow-up task to application.
   */
  async addFollowUpTask(
    applicationId: string,
    input: CreateFollowUpTaskInputType,
    userId: string
  ): Promise<FollowUpTaskItem> {
    const app = await this.getApplicationById(applicationId, userId);

    const task: FollowUpTaskItem = {
      id: randomUUID(),
      applicationId: app.id,
      title: input.title,
      dueDate: input.dueDate || null,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    app.followUps.unshift(task);
    return task;
  }

  /**
   * Toggle follow-up task completion.
   */
  async toggleFollowUpTask(
    applicationId: string,
    taskId: string,
    completed: boolean,
    userId: string
  ): Promise<FollowUpTaskItem> {
    const app = await this.getApplicationById(applicationId, userId);

    const task = app.followUps.find(t => t.id === taskId);
    if (!task) {
      throw new NotFoundException(`Follow-up task ${taskId} not found`);
    }

    task.completed = completed;
    return task;
  }
}
