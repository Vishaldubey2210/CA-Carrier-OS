import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as fs from 'node:fs';
import * as path from 'node:path';
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
export class ApplicationsService implements OnModuleInit {
  private readonly logger = new Logger(ApplicationsService.name);
  private readonly storageFile = path.resolve(process.cwd(), 'data', 'applications_store.json');

  // In-memory fallback stores: applicationId -> ApplicationRecord
  private readonly memApplications = new Map<string, ApplicationRecord>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jobsService: JobsService
  ) {
    this.loadFromDisk();
  }

  async onModuleInit(): Promise<void> {
    this.loadFromDisk();
  }

  private ensureStorageInitialized(): void {
    try {
      const dir = path.dirname(this.storageFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (!fs.existsSync(this.storageFile)) {
        fs.writeFileSync(this.storageFile, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch (err: any) {
      this.logger.warn(`Application storage init notice: ${err.message}`);
    }
  }

  private saveToDisk(): void {
    try {
      this.ensureStorageInitialized();
      const tempPath = `${this.storageFile}.tmp.${Date.now()}`;
      fs.writeFileSync(
        tempPath,
        JSON.stringify(Array.from(this.memApplications.values()), null, 2),
        'utf-8'
      );
      fs.renameSync(tempPath, this.storageFile);
    } catch (err: any) {
      this.logger.warn(`Failed saving applications to disk: ${err.message}`);
    }
  }

  private loadFromDisk(): void {
    try {
      this.ensureStorageInitialized();
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item?.id) {
              this.memApplications.set(item.id, item);
            }
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`Failed loading applications from disk: ${err.message}`);
    }
  }

  /**
   * List candidate applications in authorized personal workspace.
   */
  async listApplications(userId: string, workspaceId: string): Promise<ApplicationRecord[]> {
    if (this.prisma && this.prisma.isDatabaseConnected()) {
      try {
        const dbApps: any[] = await (this.prisma as any).application.findMany({
          where: {
            OR: [
              { candidateProfileId: userId },
              { candidate: { userId } },
            ],
          },
          include: {
            job: true,
            statusHistory: { orderBy: { changedAt: 'desc' } },
            followUps: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { statusUpdatedAt: 'desc' },
        });

        for (const da of dbApps) {
          if (!this.memApplications.has(da.id)) {
            const mappedJob: any = da.job;
            this.memApplications.set(da.id, {
              id: da.id,
              candidateProfileId: userId,
              jobId: da.jobId,
              job: mappedJob,
              resumeVersionId: da.resumeVersionId,
              status: da.status as unknown as ApplicationStatus,
              coverNote: da.coverNote,
              recruiterContact: (da.recruiterContact as any) || {},
              appliedAt: da.appliedAt ? da.appliedAt.toISOString() : null,
              statusUpdatedAt: da.statusUpdatedAt.toISOString(),
              nextFollowUpDate: da.nextFollowUpDate ? da.nextFollowUpDate.toISOString() : null,
              history: (da.statusHistory || []).map((h: any) => ({
                id: h.id,
                applicationId: da.id,
                fromStatus: h.fromStatus as any,
                toStatus: h.toStatus as any,
                notes: h.notes,
                changedAt: h.changedAt ? new Date(h.changedAt).toISOString() : new Date().toISOString(),
              })),
              followUps: (da.followUps || []).map((f: any) => ({
                id: f.id,
                applicationId: da.id,
                title: f.title,
                dueDate: f.dueDate ? new Date(f.dueDate).toISOString() : undefined,
                completed: f.completed,
                createdAt: f.createdAt ? new Date(f.createdAt).toISOString() : new Date().toISOString(),
              })),
            });
          }
        }
      } catch (err: any) {
        this.logger.warn(`Failed reading applications from DB: ${err.message}`);
      }
    }

    const apps = Array.from(this.memApplications.values()).filter(
      (app) => app.candidateProfileId === userId
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

    if (this.prisma && this.prisma.isDatabaseConnected()) {
      try {
        let profileId = userId;
        let dbProfile = await this.prisma.candidateProfile.findFirst({
          where: { OR: [{ id: userId }, { userId }] },
        });
        if (!dbProfile) {
          try {
            dbProfile = await this.prisma.candidateProfile.create({
              data: {
                id: userId,
                userId: userId,
                workspaceId: workspaceId || '00000000-0000-0000-0000-0000000001w1',
                summary: 'Chartered Accountant Candidate',
              },
            });
          } catch {
            // Profile may already exist
          }
        }
        if (dbProfile) profileId = dbProfile.id;

        // Ensure job exists in prisma.job so foreign key constraint NEVER fails
        const existingJob = await this.prisma.job.findUnique({ where: { id: input.jobId } });
        if (!existingJob) {
          await this.jobsService.getIngestionOrchestrator().persistJobToDatabase(job);
        }

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
        const appRecord: ApplicationRecord = {
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
        this.memApplications.set(appId, appRecord);
        this.saveToDisk();
        return appRecord;
      } catch (dbErr: any) {
        this.logger.warn(`Prisma create application failed: ${dbErr.message}. Falling back to memory & disk store.`);
      }
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
    this.saveToDisk();
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
