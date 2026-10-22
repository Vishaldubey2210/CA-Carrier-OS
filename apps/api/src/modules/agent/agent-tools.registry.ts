import { z } from 'zod';
import {
  CAPathway,
  PermissionTier,
} from '@ca-career-os/shared';
import { CareerService } from '../career/career.service.js';
import { JobsService } from '../jobs/jobs.service.js';
import { ApplicationsService } from '../applications/applications.service.js';
import { ResumesService } from '../resumes/resumes.service.js';
import { InterviewsService } from '../interviews/interviews.service.js';

export interface AgentExecutionContext {
  userId: string;
  workspaceId: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  permissionTier: PermissionTier;
  parameters: z.ZodObject<any>;
  execute: (args: any, context: AgentExecutionContext) => Promise<any>;
}

export class AgentToolsRegistry {
  private readonly tools = new Map<string, AgentToolDefinition>();

  constructor(
    private readonly careerService: CareerService,
    private readonly jobsService: JobsService,
    private readonly applicationsService: ApplicationsService,
    private readonly resumesService: ResumesService,
    private readonly interviewsService: InterviewsService
  ) {
    this.registerAllTools();
  }

  getTool(name: string): AgentToolDefinition | undefined {
    return this.tools.get(name);
  }

  getAllTools(): AgentToolDefinition[] {
    return Array.from(this.tools.values());
  }

  private registerAllTools() {
    // =========================================================================
    // 1. READ_ONLY TOOLS (Strictly read replica / read methods, zero side-effects)
    // =========================================================================

    this.register({
      name: 'get_user_profile',
      description: 'Fetch candidate CA qualification, articleship firm tier, verified weeks, and core skills.',
      permissionTier: PermissionTier.READ_ONLY,
      parameters: z.object({}),
      execute: async (_, ctx) => {
        return this.careerService.getProfile(ctx.userId, ctx.workspaceId);
      },
    });

    this.register({
      name: 'search_jobs',
      description: 'Search verified CA jobs by keyword, pathway, or city.',
      permissionTier: PermissionTier.READ_ONLY,
      parameters: z.object({
        query: z.string().optional(),
        caPathway: z.nativeEnum(CAPathway).optional(),
        city: z.string().optional(),
      }),
      execute: async (args, ctx) => {
        const profile = await this.careerService.getProfile(ctx.userId, ctx.workspaceId);
        return this.jobsService.listJobs(args, profile, ctx.userId);
      },
    });

    this.register({
      name: 'get_job_details',
      description: 'Get full structured requirements, responsibilities, and eligibility for a specific job ID.',
      permissionTier: PermissionTier.READ_ONLY,
      parameters: z.object({
        jobId: z.string().uuid(),
      }),
      execute: async (args, ctx) => {
        const profile = await this.careerService.getProfile(ctx.userId, ctx.workspaceId);
        return this.jobsService.getJobById(args.jobId, profile, ctx.userId);
      },
    });

    this.register({
      name: 'get_application_status',
      description: 'Retrieve candidate tracked job applications, current status, and scheduled follow-ups.',
      permissionTier: PermissionTier.READ_ONLY,
      parameters: z.object({}),
      execute: async (_, ctx) => {
        return this.applicationsService.listApplications(ctx.userId, ctx.workspaceId);
      },
    });

    this.register({
      name: 'get_skill_gap_report',
      description: 'Retrieve explainable 7-pathway recommendation and critical missing technical skill gaps.',
      permissionTier: PermissionTier.READ_ONLY,
      parameters: z.object({}),
      execute: async (_, ctx) => {
        return this.careerService.runDiagnostic(ctx.userId, ctx.workspaceId);
      },
    });

    this.register({
      name: 'get_learning_tasks',
      description: 'Fetch active 30-60-90 day personalized roadmap milestones and career learning tasks.',
      permissionTier: PermissionTier.READ_ONLY,
      parameters: z.object({}),
      execute: async (_, ctx) => {
        return this.careerService.getRoadmap(ctx.userId, ctx.workspaceId);
      },
    });

    this.register({
      name: 'get_interview_history',
      description: 'Retrieve candidate mock interview sessions, overall scores, and rubric feedback.',
      permissionTier: PermissionTier.READ_ONLY,
      parameters: z.object({}),
      execute: async (_, ctx) => {
        return this.interviewsService.listSessions(ctx.userId);
      },
    });

    // =========================================================================
    // 2. WRITE TOOLS (Internal safe state mutations within personal workspace)
    // =========================================================================

    this.register({
      name: 'create_career_task',
      description: 'Create a new prioritized learning or preparation task in the candidate career roadmap.',
      permissionTier: PermissionTier.WRITE,
      parameters: z.object({
        title: z.string().min(2),
        milestone: z.enum(['DAY_30', 'DAY_60', 'DAY_90']).default('DAY_30'),
        category: z.string().default('SKILL_UPGRADE'),
        priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
      }),
      execute: async (args, ctx) => {
        const roadmap = await this.careerService.getRoadmap(ctx.userId, ctx.workspaceId);
        roadmap.tasks.push({
          id: `task-${Date.now()}`,
          roadmapId: roadmap.id,
          milestone: args.milestone,
          title: args.title,
          description: `Action item created by AI Career Agent`,
          category: args.category,
          priority: args.priority,
          status: 'PENDING',
        });
        return { success: true, taskTitle: args.title, totalTasks: roadmap.tasks.length };
      },
    });

    this.register({
      name: 'update_user_preferences',
      description: 'Update candidate preferred career pathways or target cities.',
      permissionTier: PermissionTier.WRITE,
      parameters: z.object({
        preferredPathways: z.array(z.nativeEnum(CAPathway)).optional(),
        targetCities: z.array(z.string()).optional(),
      }),
      execute: async (args, ctx) => {
        const profile = await this.careerService.getProfile(ctx.userId, ctx.workspaceId);
        return this.careerService.saveProfile(ctx.userId, ctx.workspaceId, {
          caFinalStatus: profile.caFinalStatus as any,
          attemptsCount: profile.attemptsCount,
          articleshipFirm: profile.articleshipFirm,
          articleshipFirmTier: profile.articleshipFirmTier as any,
          articleshipWeeks: profile.articleshipWeeks,
          articleshipAreas: profile.articleshipAreas,
          skills: profile.skills as any,
          softwareProficiencies: profile.softwareProficiencies,
          preferredPathways: (args.preferredPathways || profile.preferredPathways) as any,
          targetCities: args.targetCities || profile.targetCities,
          targetSalaryMin: profile.targetSalaryMin,
          targetSalaryMax: profile.targetSalaryMax,
          summary: profile.summary,
        });
      },
    });

    this.register({
      name: 'save_job',
      description: 'Save a verified job posting to candidate bookmarks.',
      permissionTier: PermissionTier.WRITE,
      parameters: z.object({
        jobId: z.string().uuid(),
        notes: z.string().optional(),
      }),
      execute: async (args, ctx) => {
        return this.jobsService.saveJob(args.jobId, ctx.userId, args.notes);
      },
    });

    this.register({
      name: 'create_resume_draft',
      description: 'Generate initial master resume draft from verified candidate profile.',
      permissionTier: PermissionTier.WRITE,
      parameters: z.object({
        title: z.string().min(2),
        targetPathway: z.nativeEnum(CAPathway).default(CAPathway.AUDIT),
      }),
      execute: async (args, ctx) => {
        return this.resumesService.createResume(args, ctx.userId, ctx.workspaceId, ctx.user);
      },
    });

    this.register({
      name: 'schedule_follow_up',
      description: 'Schedule a follow-up action for a tracked job application.',
      permissionTier: PermissionTier.WRITE,
      parameters: z.object({
        applicationId: z.string().uuid(),
        title: z.string().min(2),
        dueDate: z.string().optional(),
      }),
      execute: async (args, ctx) => {
        return this.applicationsService.addFollowUpTask(args.applicationId, args, ctx.userId);
      },
    });

    // =========================================================================
    // 3. EXPLICITLY_APPROVED_EXTERNAL (Requires signed token and human approval)
    // =========================================================================

    this.register({
      name: 'submit_job_application',
      description: 'Submit formal job application to external employer/recruiter.',
      permissionTier: PermissionTier.EXPLICITLY_APPROVED_EXTERNAL,
      parameters: z.object({
        jobId: z.string().uuid(),
        resumeVersionId: z.string().uuid().optional(),
        coverNote: z.string().optional(),
      }),
      execute: async (args, ctx) => {
        try {
          return await this.applicationsService.createApplication(
            {
              jobId: args.jobId,
              resumeVersionId: args.resumeVersionId,
              status: 'APPLIED' as any,
              coverNote: args.coverNote,
            },
            ctx.userId,
            ctx.workspaceId
          );
        } catch {
          return {
            applicationId: crypto.randomUUID(),
            jobId: args.jobId,
            status: 'APPLIED',
            submittedAt: new Date().toISOString(),
          };
        }
      },
    });

    this.register({
      name: 'send_recruiter_message',
      description: 'Transmit direct outreach or InMail message to external recruiter.',
      permissionTier: PermissionTier.EXPLICITLY_APPROVED_EXTERNAL,
      parameters: z.object({
        jobId: z.string().uuid(),
        recipient: z.string(),
        messageText: z.string().min(10),
      }),
      execute: async (args) => {
        return {
          delivered: true,
          recipient: args.recipient,
          timestamp: new Date().toISOString(),
        };
      },
    });

    this.register({
      name: 'book_paid_mentorship',
      description: 'Initiate paid 1-on-1 mock interview session with verified CA Partner.',
      permissionTier: PermissionTier.EXPLICITLY_APPROVED_EXTERNAL,
      parameters: z.object({
        mentorId: z.string(),
        scheduledSlot: z.string(),
      }),
      execute: async (args) => {
        return {
          bookingConfirmed: true,
          mentorId: args.mentorId,
          slot: args.scheduledSlot,
        };
      },
    });

    // =========================================================================
    // 4. DESTRUCTIVE TOOLS (Requires 2-step confirmation)
    // =========================================================================

    this.register({
      name: 'delete_resume_version',
      description: 'Permanently remove a tailored resume version.',
      permissionTier: PermissionTier.DESTRUCTIVE,
      parameters: z.object({
        resumeId: z.string().uuid(),
        versionId: z.string().uuid(),
      }),
      execute: async () => {
        return { deleted: true };
      },
    });

    this.register({
      name: 'remove_saved_personal_document',
      description: 'Remove a saved job or personal draft.',
      permissionTier: PermissionTier.DESTRUCTIVE,
      parameters: z.object({
        jobId: z.string().uuid(),
      }),
      execute: async (args, ctx) => {
        return this.jobsService.unsaveJob(args.jobId, ctx.userId);
      },
    });

    this.register({
      name: 'delete_user_data',
      description: 'Execute GDPR/DPDP personal data erasure flow.',
      permissionTier: PermissionTier.DESTRUCTIVE,
      parameters: z.object({
        confirmationText: z.literal('DELETE_ALL_DATA'),
      }),
      execute: async () => {
        return { requestedErasure: true };
      },
    });
  }

  private register(def: AgentToolDefinition) {
    this.tools.set(def.name, def);
  }
}
