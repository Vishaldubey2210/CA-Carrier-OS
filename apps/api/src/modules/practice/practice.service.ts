import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  PostQualificationChecklistItem,
  PracticeClientDetail,
  PracticeComplianceTaskDetail,
  CreatePracticeClientInputType,
  CreatePracticeComplianceTaskInputType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { CURATED_POST_QUALIFICATION_ITEMS } from './post-qualification.data.js';

@Injectable()
export class PracticeService {
  private readonly logger = new Logger(PracticeService.name);

  // In-memory fallback stores for development & isolated tests
  private readonly memChecklists = new Map<string, Map<string, PostQualificationChecklistItem>>(); // userId -> (taskKey -> item)
  private readonly memClients = new Map<string, PracticeClientDetail>(); // clientId -> PracticeClientDetail
  private readonly memTasks = new Map<string, PracticeComplianceTaskDetail>(); // taskId -> PracticeComplianceTaskDetail

  constructor(private readonly prisma: PrismaService) {}

  // =========================================================================
  // 1. Post-Qualification Guidance & Checklists
  // =========================================================================

  /**
   * Retrieve candidate's personalized post-qualification checklist.
   */
  async getPostQualificationChecklist(userId: string): Promise<PostQualificationChecklistItem[]> {
    let userMap = this.memChecklists.get(userId);
    if (!userMap) {
      userMap = new Map<string, PostQualificationChecklistItem>();
      for (const item of CURATED_POST_QUALIFICATION_ITEMS) {
        userMap.set(item.taskKey, {
          ...item,
          id: randomUUID(),
          userId,
          isCompleted: false,
          completedAt: null,
          notes: null,
        });
      }
      this.memChecklists.set(userId, userMap);
    }
    return Array.from(userMap.values());
  }

  /**
   * Toggle completion state of a post-qualification guidance item.
   */
  async toggleChecklistTask(
    userId: string,
    taskKey: string,
    isCompleted: boolean,
    notes?: string
  ): Promise<PostQualificationChecklistItem> {
    const list = await this.getPostQualificationChecklist(userId);
    const userMap = this.memChecklists.get(userId)!;
    const task = userMap.get(taskKey);

    if (!task) {
      throw new NotFoundException(`Task key ${taskKey} not found in post-qualification checklist`);
    }

    task.isCompleted = isCompleted;
    task.completedAt = isCompleted ? new Date().toISOString() : null;
    if (notes !== undefined) task.notes = notes;

    this.logger.log(`User ${userId} toggled task ${taskKey} to ${isCompleted}`);
    return task;
  }

  // =========================================================================
  // 2. Practice Management CRM (Firm Workspace Only)
  // =========================================================================

  /**
   * Create a practice client.
   * Strictly bound to the practice Organization Workspace.
   */
  async createClient(
    input: CreatePracticeClientInputType,
    practiceWorkspaceId: string
  ): Promise<PracticeClientDetail> {
    const clientId = randomUUID();

    if (this.prisma.isDatabaseConnected()) {
      const dbClient = await this.prisma.practiceClient.create({
        data: {
          id: clientId,
          practiceWorkspaceId,
          clientName: input.clientName,
          entityType: input.entityType,
          panNumber: input.panNumber || null,
          gstin: input.gstin || null,
          cin: input.cin || null,
          contactPerson: input.contactPerson,
          contactEmail: input.contactEmail,
          contactPhone: input.contactPhone || null,
          status: 'ACTIVE',
        },
      });
      this.logger.log(`Created practice client ${dbClient.id} in DB workspace ${practiceWorkspaceId}`);
      return {
        id: dbClient.id,
        practiceWorkspaceId: dbClient.practiceWorkspaceId,
        clientName: dbClient.clientName,
        entityType: dbClient.entityType as any,
        panNumber: dbClient.panNumber,
        gstin: dbClient.gstin,
        cin: dbClient.cin,
        contactPerson: dbClient.contactPerson,
        contactEmail: dbClient.contactEmail,
        contactPhone: dbClient.contactPhone,
        status: dbClient.status as any,
        createdAt: dbClient.createdAt.toISOString(),
      };
    }

    const client: PracticeClientDetail = {
      id: clientId,
      practiceWorkspaceId,
      clientName: input.clientName,
      entityType: input.entityType,
      panNumber: input.panNumber || null,
      gstin: input.gstin || null,
      cin: input.cin || null,
      contactPerson: input.contactPerson,
      contactEmail: input.contactEmail,
      contactPhone: input.contactPhone || null,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    this.memClients.set(clientId, client);
    this.logger.log(`Created practice client ${clientId} (${client.clientName}) in workspace ${practiceWorkspaceId}`);
    return client;
  }

  /**
   * List practice clients for an authorized practice workspace.
   * Enforces zero leakage across unrelated workspaces.
   */
  async listClients(practiceWorkspaceId: string): Promise<PracticeClientDetail[]> {
    if (this.prisma.isDatabaseConnected()) {
      const dbClients = await this.prisma.practiceClient.findMany({
        where: { practiceWorkspaceId },
        orderBy: { createdAt: 'desc' },
      });
      return dbClients.map((c) => ({
        id: c.id,
        practiceWorkspaceId: c.practiceWorkspaceId,
        clientName: c.clientName,
        entityType: c.entityType as any,
        panNumber: c.panNumber,
        gstin: c.gstin,
        cin: c.cin,
        contactPerson: c.contactPerson,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
        status: c.status as any,
        createdAt: c.createdAt.toISOString(),
      }));
    }

    return Array.from(this.memClients.values()).filter(
      (c) => c.practiceWorkspaceId === practiceWorkspaceId
    );
  }

  /**
   * Get single client with workspace isolation check.
   */
  async getClientById(clientId: string, practiceWorkspaceId: string): Promise<PracticeClientDetail> {
    if (this.prisma.isDatabaseConnected()) {
      const dbClient = await this.prisma.practiceClient.findUnique({
        where: { id: clientId },
      });
      if (!dbClient) {
        throw new NotFoundException(`Client with ID ${clientId} not found`);
      }
      if (dbClient.practiceWorkspaceId !== practiceWorkspaceId) {
        throw new ForbiddenException('Access denied: Client belongs to another practice workspace');
      }
      return {
        id: dbClient.id,
        practiceWorkspaceId: dbClient.practiceWorkspaceId,
        clientName: dbClient.clientName,
        entityType: dbClient.entityType as any,
        panNumber: dbClient.panNumber,
        gstin: dbClient.gstin,
        cin: dbClient.cin,
        contactPerson: dbClient.contactPerson,
        contactEmail: dbClient.contactEmail,
        contactPhone: dbClient.contactPhone,
        status: dbClient.status as any,
        createdAt: dbClient.createdAt.toISOString(),
      };
    }

    const client = this.memClients.get(clientId);
    if (!client) {
      throw new NotFoundException(`Client with ID ${clientId} not found`);
    }
    if (client.practiceWorkspaceId !== practiceWorkspaceId) {
      throw new ForbiddenException('Access denied: Client belongs to another practice workspace');
    }
    return client;
  }

  /**
   * Create a statutory compliance task for a client.
   */
  async createComplianceTask(
    input: CreatePracticeComplianceTaskInputType,
    practiceWorkspaceId: string,
    assignedToUserId?: string
  ): Promise<PracticeComplianceTaskDetail> {
    // Verify client belongs to this practice workspace
    await this.getClientById(input.clientId, practiceWorkspaceId);

    const taskId = randomUUID();
    const task: PracticeComplianceTaskDetail = {
      id: taskId,
      practiceWorkspaceId,
      clientId: input.clientId,
      title: input.title,
      complianceCategory: input.complianceCategory,
      statutoryDueDate: input.statutoryDueDate,
      internalDeadline: input.internalDeadline,
      assignedToUserId: assignedToUserId || null,
      status: 'PENDING',
      financialYear: input.financialYear,
      assessmentYear: input.assessmentYear,
      filedReferenceNo: null,
      notes: input.notes || null,
      createdAt: new Date().toISOString(),
    };

    this.memTasks.set(taskId, task);
    this.logger.log(`Created compliance task ${taskId} (${task.title})`);
    return task;
  }

  /**
   * List compliance tasks for practice workspace with optional category/status filters.
   */
  async listComplianceTasks(
    practiceWorkspaceId: string,
    category?: string,
    status?: string
  ): Promise<PracticeComplianceTaskDetail[]> {
    let list = Array.from(this.memTasks.values()).filter(
      (t) => t.practiceWorkspaceId === practiceWorkspaceId
    );
    if (category) {
      list = list.filter((t) => t.complianceCategory === category);
    }
    if (status) {
      list = list.filter((t) => t.status === status);
    }
    return list;
  }

  /**
   * Update task status (e.g. from PENDING to FILED with acknowledgement number).
   */
  async updateTaskStatus(
    taskId: string,
    status: 'PENDING' | 'IN_PROGRESS' | 'REVIEW_PENDING' | 'FILED' | 'OVERDUE',
    filedReferenceNo: string | undefined,
    practiceWorkspaceId: string
  ): Promise<PracticeComplianceTaskDetail> {
    const task = this.memTasks.get(taskId);
    if (!task) {
      throw new NotFoundException(`Compliance task ${taskId} not found`);
    }
    if (task.practiceWorkspaceId !== practiceWorkspaceId) {
      throw new ForbiddenException('Access denied to compliance task');
    }

    task.status = status;
    if (filedReferenceNo) task.filedReferenceNo = filedReferenceNo;

    return task;
  }
}
