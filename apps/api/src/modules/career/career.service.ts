import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CandidateProfileData,
  CandidateProfileInput,
  CandidateProfileInputSchema,
  CAPathway,
  SkillGapAnalysisReport,
  CareerRoadmapDetail,
  CareerRoadmapTaskItem,
  WorkspaceType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import {
  calculateProfileCompletion,
  runCareerDiagnostic,
  generateRoadmapTasks,
} from './career-intelligence.engine.js';

interface InMemoryRoadmap {
  id: string;
  candidateProfileId: string;
  workspaceId: string;
  targetPathway: CAPathway;
  overallFitScore: number;
  summary: string;
  tasks: CareerRoadmapTaskItem[];
  generatedAt: string;
}

@Injectable()
export class CareerService {
  private readonly logger = new Logger(CareerService.name);

  // In-memory fallback stores
  private readonly memProfiles = new Map<string, CandidateProfileData>(); // userId -> profile
  private readonly memRoadmaps = new Map<string, InMemoryRoadmap>(); // candidateProfileId -> roadmap

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get candidate profile for user in their personal workspace
   */
  async getProfile(userId: string, workspaceId: string): Promise<CandidateProfileData> {
    if (this.prisma.isDatabaseConnected()) {
      const dbProfile = await this.prisma.candidateProfile.findUnique({
        where: { userId },
      });

      if (!dbProfile) {
        return this.createDefaultProfile(userId, workspaceId);
      }

      const skills = (dbProfile.skills as any) || [];
      const profileData: CandidateProfileData = {
        id: dbProfile.id,
        userId: dbProfile.userId,
        workspaceId: dbProfile.workspaceId,
        icaiMembershipNo: dbProfile.icaiMembershipNo,
        qualificationDate: dbProfile.qualificationDate ? dbProfile.qualificationDate.toISOString() : null,
        caFinalStatus: dbProfile.caFinalStatus,
        attemptsCount: dbProfile.attemptsCount,
        articleshipFirm: dbProfile.articleshipFirm,
        articleshipFirmTier: dbProfile.articleshipFirmTier,
        articleshipWeeks: dbProfile.articleshipWeeks,
        articleshipAreas: dbProfile.articleshipAreas,
        skills,
        softwareProficiencies: dbProfile.softwareProficiencies,
        preferredPathways: dbProfile.preferredPathways,
        targetCities: dbProfile.targetCities,
        targetSalaryMin: dbProfile.targetSalaryMin,
        targetSalaryMax: dbProfile.targetSalaryMax,
        summary: dbProfile.summary,
        profileCompletionPct: dbProfile.profileCompletionPct,
        updatedAt: dbProfile.updatedAt.toISOString(),
      };

      profileData.profileCompletionPct = calculateProfileCompletion(profileData);
      return profileData;
    } else {
      const mem = this.memProfiles.get(userId);
      if (!mem) {
        const initial = this.createDefaultProfile(userId, workspaceId);
        this.memProfiles.set(userId, initial);
        return initial;
      }
      mem.profileCompletionPct = calculateProfileCompletion(mem);
      return mem;
    }
  }

  /**
   * Save or update candidate profile
   */
  async saveProfile(
    userId: string,
    workspaceId: string,
    rawInput: CandidateProfileInput
  ): Promise<CandidateProfileData> {
    const input = CandidateProfileInputSchema.parse(rawInput);
    const completionPct = calculateProfileCompletion({
      ...input,
      userId,
      workspaceId,
    });

    if (this.prisma.isDatabaseConnected()) {
      const upserted = await this.prisma.candidateProfile.upsert({
        where: { userId },
        create: {
          userId,
          workspaceId,
          icaiMembershipNo: input.icaiMembershipNo,
          qualificationDate: input.qualificationDate ? new Date(input.qualificationDate) : null,
          caFinalStatus: input.caFinalStatus,
          attemptsCount: input.attemptsCount,
          articleshipFirm: input.articleshipFirm,
          articleshipFirmTier: input.articleshipFirmTier,
          articleshipWeeks: input.articleshipWeeks,
          articleshipAreas: input.articleshipAreas,
          skills: input.skills as any,
          softwareProficiencies: input.softwareProficiencies,
          preferredPathways: input.preferredPathways,
          targetCities: input.targetCities,
          targetSalaryMin: input.targetSalaryMin,
          targetSalaryMax: input.targetSalaryMax,
          summary: input.summary,
          profileCompletionPct: completionPct,
        },
        update: {
          icaiMembershipNo: input.icaiMembershipNo,
          qualificationDate: input.qualificationDate ? new Date(input.qualificationDate) : null,
          caFinalStatus: input.caFinalStatus,
          attemptsCount: input.attemptsCount,
          articleshipFirm: input.articleshipFirm,
          articleshipFirmTier: input.articleshipFirmTier,
          articleshipWeeks: input.articleshipWeeks,
          articleshipAreas: input.articleshipAreas,
          skills: input.skills as any,
          softwareProficiencies: input.softwareProficiencies,
          preferredPathways: input.preferredPathways,
          targetCities: input.targetCities,
          targetSalaryMin: input.targetSalaryMin,
          targetSalaryMax: input.targetSalaryMax,
          summary: input.summary,
          profileCompletionPct: completionPct,
        },
      });

      await this.prisma.auditEvent.create({
        data: {
          actorId: userId,
          workspaceId,
          operation: 'CANDIDATE_PROFILE_UPDATED',
          resourceType: 'CandidateProfile',
          resourceId: upserted.id,
          outcome: 'SUCCESS',
          correlationId: randomUUID(),
          payloadSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          durationMs: 0,
        },
      });

      return {
        id: upserted.id,
        userId: upserted.userId,
        workspaceId: upserted.workspaceId,
        icaiMembershipNo: upserted.icaiMembershipNo,
        qualificationDate: upserted.qualificationDate ? upserted.qualificationDate.toISOString() : null,
        caFinalStatus: upserted.caFinalStatus,
        attemptsCount: upserted.attemptsCount,
        articleshipFirm: upserted.articleshipFirm,
        articleshipFirmTier: upserted.articleshipFirmTier,
        articleshipWeeks: upserted.articleshipWeeks,
        articleshipAreas: upserted.articleshipAreas,
        skills: (upserted.skills as any) || [],
        softwareProficiencies: upserted.softwareProficiencies,
        preferredPathways: upserted.preferredPathways,
        targetCities: upserted.targetCities,
        targetSalaryMin: upserted.targetSalaryMin,
        targetSalaryMax: upserted.targetSalaryMax,
        summary: upserted.summary,
        profileCompletionPct: completionPct,
        updatedAt: upserted.updatedAt.toISOString(),
      };
    } else {
      const existing = this.memProfiles.get(userId);
      const profileId = existing?.id || randomUUID();
      const updated: CandidateProfileData = {
        id: profileId,
        userId,
        workspaceId,
        icaiMembershipNo: input.icaiMembershipNo || null,
        qualificationDate: input.qualificationDate || null,
        caFinalStatus: input.caFinalStatus,
        attemptsCount: input.attemptsCount ?? null,
        articleshipFirm: input.articleshipFirm || null,
        articleshipFirmTier: input.articleshipFirmTier || null,
        articleshipWeeks: input.articleshipWeeks,
        articleshipAreas: input.articleshipAreas,
        skills: input.skills,
        softwareProficiencies: input.softwareProficiencies,
        preferredPathways: input.preferredPathways,
        targetCities: input.targetCities,
        targetSalaryMin: input.targetSalaryMin ?? null,
        targetSalaryMax: input.targetSalaryMax ?? null,
        summary: input.summary || null,
        profileCompletionPct: completionPct,
        updatedAt: new Date().toISOString(),
      };
      this.memProfiles.set(userId, updated);
      return updated;
    }
  }

  /**
   * Run 6-pathway diagnostic scoring & skill gap report
   */
  async runDiagnostic(userId: string, workspaceId: string): Promise<SkillGapAnalysisReport> {
    const profile = await this.getProfile(userId, workspaceId);
    return runCareerDiagnostic(profile);
  }

  /**
   * Fetch current personalized career roadmap and tasks
   */
  async getRoadmap(userId: string, workspaceId: string): Promise<CareerRoadmapDetail> {
    const profile = await this.getProfile(userId, workspaceId);

    if (this.prisma.isDatabaseConnected()) {
      const dbRoadmap = await this.prisma.careerRoadmap.findFirst({
        where: { candidateProfileId: profile.id },
        include: { tasks: { orderBy: { createdAt: 'asc' } } },
      });

      if (dbRoadmap) {
        const completedTasks = dbRoadmap.tasks.filter((t) => t.status === 'COMPLETED').length;
        const total = dbRoadmap.tasks.length;
        return {
          id: dbRoadmap.id,
          candidateProfileId: dbRoadmap.candidateProfileId,
          workspaceId: dbRoadmap.workspaceId,
          targetPathway: dbRoadmap.targetPathway as unknown as CAPathway,
          overallFitScore: dbRoadmap.overallFitScore,
          summary: dbRoadmap.summary,
          tasks: dbRoadmap.tasks.map((t) => ({
            id: t.id,
            roadmapId: t.roadmapId,
            milestone: t.milestone as any,
            title: t.title,
            description: t.description,
            category: t.category,
            priority: t.priority as any,
            status: t.status as any,
            completedAt: t.completedAt ? t.completedAt.toISOString() : null,
            dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          })),
          progressPct: total > 0 ? Math.round((completedTasks / total) * 100) : 0,
          generatedAt: dbRoadmap.generatedAt.toISOString(),
        };
      }
    } else {
      const mem = this.memRoadmaps.get(profile.id);
      if (mem) {
        const completed = mem.tasks.filter((t) => t.status === 'COMPLETED').length;
        const total = mem.tasks.length;
        return {
          ...mem,
          progressPct: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
      }
    }

    // Default roadmap generation for top pathway if not yet created
    const diagnostic = await this.runDiagnostic(userId, workspaceId);
    return await this.generateRoadmap(userId, workspaceId, diagnostic.topRecommendedPathway);
  }

  /**
   * Generate or regenerate actionable 30-60-90 day plan for selected target pathway
   */
  async generateRoadmap(
    userId: string,
    workspaceId: string,
    targetPathway: CAPathway
  ): Promise<CareerRoadmapDetail> {
    const profile = await this.getProfile(userId, workspaceId);
    const diagnostic = await this.runDiagnostic(userId, workspaceId);
    const targetReport =
      diagnostic.pathwayFitReports.find((p) => p.pathway === targetPathway) ||
      diagnostic.pathwayFitReports[0];

    const roadmapId = randomUUID();
    const fitScore = targetReport?.fitScore || 75;
    const summary = `Personalized 90-day execution roadmap tailored for ${targetReport?.title || targetPathway}. Focuses on bridging technical standards and case studies.`;
    const tasks = generateRoadmapTasks(targetPathway, roadmapId, targetReport?.missingSkills || []);

    if (this.prisma.isDatabaseConnected()) {
      // Clean up previous roadmaps for this profile to prevent task duplication
      await this.prisma.careerRoadmap.deleteMany({
        where: { candidateProfileId: profile.id },
      });

      const created = await this.prisma.careerRoadmap.create({
        data: {
          id: roadmapId,
          candidateProfileId: profile.id,
          workspaceId,
          targetPathway,
          overallFitScore: fitScore,
          summary,
          tasks: {
            create: tasks.map((t) => ({
              id: t.id,
              milestone: t.milestone,
              title: t.title,
              description: t.description,
              category: t.category,
              priority: t.priority,
              status: t.status,
            })),
          },
        },
        include: { tasks: true },
      });

      await this.prisma.auditEvent.create({
        data: {
          actorId: userId,
          workspaceId,
          operation: 'ROADMAP_GENERATED',
          resourceType: 'CareerRoadmap',
          resourceId: created.id,
          outcome: 'SUCCESS',
          correlationId: randomUUID(),
          payloadSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          durationMs: 0,
        },
      });

      return {
        id: created.id,
        candidateProfileId: created.candidateProfileId,
        workspaceId: created.workspaceId,
        targetPathway: created.targetPathway as unknown as CAPathway,
        overallFitScore: created.overallFitScore,
        summary: created.summary,
        tasks: created.tasks.map((t) => ({
          id: t.id,
          roadmapId: t.roadmapId,
          milestone: t.milestone as any,
          title: t.title,
          description: t.description,
          category: t.category,
          priority: t.priority as any,
          status: t.status as any,
          completedAt: t.completedAt ? t.completedAt.toISOString() : null,
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        })),
        progressPct: 0,
        generatedAt: created.generatedAt.toISOString(),
      };
    } else {
      const roadmapDetail: InMemoryRoadmap = {
        id: roadmapId,
        candidateProfileId: profile.id,
        workspaceId,
        targetPathway,
        overallFitScore: fitScore,
        summary,
        tasks,
        generatedAt: new Date().toISOString(),
      };
      this.memRoadmaps.set(profile.id, roadmapDetail);
      return {
        ...roadmapDetail,
        progressPct: 0,
      };
    }
  }

  /**
   * Toggle task status (e.g. mark completed)
   */
  async updateTaskStatus(
    userId: string,
    workspaceId: string,
    taskId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
  ): Promise<CareerRoadmapTaskItem> {
    if (this.prisma.isDatabaseConnected()) {
      const task = await this.prisma.careerTask.findUnique({
        where: { id: taskId },
        include: { roadmap: true },
      });

      if (!task) {
        throw new NotFoundException(`Task ${taskId} not found`);
      }

      if (task.roadmap.workspaceId !== workspaceId) {
        throw new ForbiddenException('Task does not belong to the active workspace');
      }

      const updated = await this.prisma.careerTask.update({
        where: { id: taskId },
        data: {
          status,
          completedAt: status === 'COMPLETED' ? new Date() : null,
        },
      });

      return {
        id: updated.id,
        roadmapId: updated.roadmapId,
        milestone: updated.milestone as any,
        title: updated.title,
        description: updated.description,
        category: updated.category,
        priority: updated.priority as any,
        status: updated.status as any,
        completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
      };
    } else {
      for (const rm of this.memRoadmaps.values()) {
        const t = rm.tasks.find((task) => task.id === taskId);
        if (t) {
          t.status = status;
          t.completedAt = status === 'COMPLETED' ? new Date().toISOString() : null;
          return t;
        }
      }
      throw new NotFoundException(`Task ${taskId} not found`);
    }
  }

  /**
   * Default template profile
   */
  private createDefaultProfile(userId: string, workspaceId: string): CandidateProfileData {
    return {
      id: randomUUID(),
      userId,
      workspaceId,
      icaiMembershipNo: null,
      qualificationDate: null,
      caFinalStatus: 'QUALIFIED',
      attemptsCount: 1,
      articleshipFirm: null,
      articleshipFirmTier: null,
      articleshipWeeks: 156,
      articleshipAreas: [],
      skills: [],
      softwareProficiencies: ['AdvancedExcel', 'TallyPrime'],
      preferredPathways: [CAPathway.AUDIT, CAPathway.CORP_FIN],
      targetCities: ['Mumbai', 'Bengaluru'],
      targetSalaryMin: 1200000,
      targetSalaryMax: 1800000,
      summary: null,
      profileCompletionPct: 20,
      updatedAt: new Date().toISOString(),
    };
  }
}
