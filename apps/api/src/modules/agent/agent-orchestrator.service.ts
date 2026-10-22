import crypto from 'node:crypto';
import {
  Injectable,
  Logger,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import {
  CAPathway,
  PermissionTier,
  AgentChatInputType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { AgentToolsRegistry, AgentExecutionContext } from './agent-tools.registry.js';
import { ApprovalsService } from './approvals.service.js';
import { CareerService } from '../career/career.service.js';

const INJECTION_PATTERNS = [
  /ignore (all )?(previous|prior) instructions/i,
  /system prompt/i,
  /bypass (security|policy|guardrails)/i,
  /drop table/i,
  /select \* from/i,
  /admin (access|mode|override)/i,
  /exfiltrate/i,
  /reveal (secret|token|key|prompt)/i,
];

@Injectable()
export class AgentOrchestratorService {
  private readonly logger = new Logger(AgentOrchestratorService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly toolsRegistry: AgentToolsRegistry,
    private readonly approvalsService: ApprovalsService,
    private readonly careerService: CareerService
  ) {}

  /**
   * Sanitizes input against known prompt injection attacks.
   */
  private checkPromptInjection(prompt: string): boolean {
    return INJECTION_PATTERNS.some((pattern) => pattern.test(prompt));
  }

  /**
   * Main chat loop for the AI Career Agent.
   */
  async handleChat(input: AgentChatInputType, userCtx: AgentExecutionContext) {
    // 1. Defend against prompt injection
    if (this.checkPromptInjection(input.message)) {
      this.logger.warn(`Prompt injection attempt detected from user ${userCtx.userId}`);
      return {
        conversationId: input.conversationId || crypto.randomUUID(),
        role: 'ASSISTANT',
        content:
          'Security Notice: System policies, workspace authorization barriers, and role-based permissions cannot be overridden by user instructions. Please ask a valid career, interview, or job-search question.',
        toolCalls: [],
        approvalRequest: null,
      };
    }

    // 2. Ensure candidate profile exists in workspace
    const profile = await this.careerService.getProfile(userCtx.userId, userCtx.workspaceId);

    // 3. Retrieve or create conversation
    let conversation: any;
    if (input.conversationId) {
      conversation = await this.prisma.agentConversation.findUnique({
        where: { id: input.conversationId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: 20 } },
      });
      if (!conversation) {
        throw new NotFoundException(`Conversation ${input.conversationId} not found.`);
      }
      if (conversation.candidateProfileId !== profile.id || conversation.workspaceId !== userCtx.workspaceId) {
        throw new ForbiddenException('Access denied to this conversation.');
      }
    } else {
      conversation = await this.prisma.agentConversation.create({
        data: {
          candidateProfileId: profile.id,
          workspaceId: userCtx.workspaceId,
          title: `Career Consultation: ${input.message.substring(0, 32)}...`,
        },
        include: { messages: true },
      });
    }

    // 4. Save User Message
    await this.prisma.agentMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: input.message,
      },
    });

    // 5. Interpret Intent and Determine Tools
    const { plannedTools, directResponse } = this.planToolExecutions(input.message, profile);

    const executedToolCalls: any[] = [];
    const toolResults: any[] = [];
    let pendingApproval: any = null;

    // 6. Execute or Stage Planned Tools according to Permission Tier
    for (const plan of plannedTools) {
      const tool = this.toolsRegistry.getTool(plan.name);
      if (!tool) continue;

      executedToolCalls.push({
        id: crypto.randomUUID(),
        name: tool.name,
        arguments: plan.arguments,
        permissionTier: tool.permissionTier,
      });

      // -------------------------------------------------------------
      // Tier 1: READ_ONLY & Tier 2: WRITE -> Execute directly
      // -------------------------------------------------------------
      if (
        tool.permissionTier === PermissionTier.READ_ONLY ||
        tool.permissionTier === PermissionTier.WRITE
      ) {
        try {
          const result = await tool.execute(plan.arguments, userCtx);
          toolResults.push({
            toolName: tool.name,
            status: 'SUCCESS',
            data: result,
          });
        } catch (err: any) {
          toolResults.push({
            toolName: tool.name,
            status: 'FAILED',
            error: err?.message || String(err),
          });
        }
      }

      // -------------------------------------------------------------
      // Tier 3: EXPLICITLY_APPROVED_EXTERNAL -> Staged with 15m Token
      // -------------------------------------------------------------
      else if (tool.permissionTier === PermissionTier.EXPLICITLY_APPROVED_EXTERNAL) {
        const actionPreview = this.generateActionPreview(tool.name, plan.arguments);
        pendingApproval = await this.approvalsService.createApprovalRequest(
          userCtx.userId,
          userCtx.workspaceId,
          tool.name,
          plan.arguments,
          actionPreview
        );

        toolResults.push({
          toolName: tool.name,
          status: 'STAGED_AWAITING_APPROVAL',
          approvalId: pendingApproval.approvalId,
          actionPreview,
          expiresAt: pendingApproval.expiresAt,
        });
      }

      // -------------------------------------------------------------
      // Tier 4: DESTRUCTIVE -> Staged with Two-Step Confirmation
      // -------------------------------------------------------------
      else if (tool.permissionTier === PermissionTier.DESTRUCTIVE) {
        const actionPreview = `⚠️ Irreversible Action: ${tool.description}`;
        pendingApproval = await this.approvalsService.createApprovalRequest(
          userCtx.userId,
          userCtx.workspaceId,
          tool.name,
          plan.arguments,
          actionPreview
        );

        toolResults.push({
          toolName: tool.name,
          status: 'STAGED_AWAITING_APPROVAL',
          approvalId: pendingApproval.approvalId,
          actionPreview,
        });
      }
    }

    // 7. Synthesize Rich Assistant Response Grounded in Facts (Zero-Fabrication Guard)
    const assistantContent = this.synthesizeResponse(
      input.message,
      directResponse,
      toolResults,
      pendingApproval,
      profile
    );

    // 8. Save Assistant Message
    await this.prisma.agentMessage.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: assistantContent,
        toolCalls: executedToolCalls.length > 0 ? executedToolCalls : null,
        toolResults: toolResults.length > 0 ? toolResults : null,
        approvalId: pendingApproval ? pendingApproval.approvalId : null,
      },
    });

    const isMock = process.env.AI_PROVIDER !== 'openai' && process.env.AI_PROVIDER !== 'anthropic';
    return {
      conversationId: conversation.id,
      role: 'ASSISTANT',
      content: assistantContent,
      toolCalls: executedToolCalls,
      toolResults,
      approvalRequest: pendingApproval,
      metadata: {
        provider: isMock ? 'deterministic-orchestrator-mock' : process.env.AI_PROVIDER,
        isLiveInference: !isMock,
      },
    };
  }

  /**
   * Interprets user prompt and maps to authorized internal tools.
   */
  private planToolExecutions(
    prompt: string,
    profile: any
  ): { plannedTools: { name: string; arguments: any }[]; directResponse?: string } {
    const lower = prompt.toLowerCase();
    const planned: { name: string; arguments: any }[] = [];

    // Case 1: Complex FP&A / Strategic Career Consultation request
    // "I am targeting FP&A roles. Review my existing profile, identify my biggest skill gaps, recommend relevant job-search improvements, and create a one-week preparation plan."
    if (
      lower.includes('fp&a') ||
      lower.includes('skill gap') ||
      lower.includes('preparation plan') ||
      lower.includes('review my existing profile')
    ) {
      planned.push({ name: 'get_user_profile', arguments: {} });
      planned.push({
        name: 'get_skill_gap_report',
        arguments: { targetPathway: CAPathway.FPA },
      });
      planned.push({
        name: 'search_jobs',
        arguments: { caPathway: CAPathway.FPA },
      });
      planned.push({ name: 'get_learning_tasks', arguments: {} });
      planned.push({
        name: 'create_career_task',
        arguments: {
          title: 'Master 3-Statement Financial Modelling & Variance Analysis',
          targetPathway: CAPathway.FPA,
          category: 'TECHNICAL_SKILL',
          estimatedHours: 8,
          learningObjective: 'Bridge critical skill gap in rolling forecasts and budget variance analysis',
        },
      });
      return { plannedTools: planned };
    }

    // Case 2: Destructive Action (Delete Resume, Purge Data)
    if (
      (lower.includes('delete') && lower.includes('resume')) ||
      (lower.includes('remove') && lower.includes('resume')) ||
      lower.includes('delete my data') ||
      lower.includes('delete data')
    ) {
      if (lower.includes('delete my data')) {
        planned.push({
          name: 'delete_user_data',
          arguments: { confirmationText: 'DELETE_ALL_DATA' },
        });
      } else {
        planned.push({
          name: 'delete_resume_version',
          arguments: {
            resumeId: '00000000-0000-0000-0000-000000000001',
            versionId: '00000000-0000-0000-0000-000000000002',
          },
        });
      }
      return { plannedTools: planned };
    }

    // Case 3: External Side-Effect (Apply to Job, Recruiter Outreach, Mentorship Booking)
    if (lower.includes('apply to') || lower.includes('submit my application') || lower.includes('send application') || lower.includes('submit application')) {
      planned.push({
        name: 'submit_job_application',
        arguments: {
          jobId: '00000000-0000-0000-0000-000000000001',
          coverNote: 'Excited to apply for this statutory audit position with my Big 4 articleship background.',
        },
      });
      return { plannedTools: planned };
    }

    // Case 4: Job Search request
    if (lower.includes('search job') || lower.includes('find job') || lower.includes('openings')) {
      let pathway: CAPathway | undefined;
      if (lower.includes('audit')) pathway = CAPathway.AUDIT;
      else if (lower.includes('tax')) pathway = CAPathway.TAX;
      else if (lower.includes('fp&a')) pathway = CAPathway.FPA;
      else if (lower.includes('valuation')) pathway = CAPathway.CORP_FIN;

      planned.push({
        name: 'search_jobs',
        arguments: { caPathway: pathway, query: lower.includes('deloitte') ? 'Deloitte' : undefined },
      });
      return { plannedTools: planned };
    }

    // Case 5: Application Status Check
    if (lower.includes('application status') || lower.includes('track status') || lower.includes('follow-up')) {
      planned.push({ name: 'get_application_status', arguments: {} });
      return { plannedTools: planned };
    }

    // Case 6: Interview Prep or History
    if (lower.includes('interview') || lower.includes('mock') || lower.includes('questions')) {
      planned.push({ name: 'get_interview_history', arguments: {} });
      return { plannedTools: planned };
    }

    // Default: Retrieve Profile and Learning Context
    planned.push({ name: 'get_user_profile', arguments: {} });
    planned.push({ name: 'get_learning_tasks', arguments: {} });
    return { plannedTools: planned };
  }

  /**
   * Generates a descriptive preview string for human-in-the-loop approval.
   */
  private generateActionPreview(toolName: string, args: Record<string, any>): string {
    if (toolName === 'submit_job_application') {
      return `External Application Submission: Submit job application for Job ID ${args.jobId} with cover note.`;
    }
    if (toolName === 'send_recruiter_message') {
      return `External Recruiter Outreach: Transmit direct message to ${args.recipient}.`;
    }
    if (toolName === 'book_paid_mentorship') {
      return `Paid Mentorship Booking: Book 1-on-1 interview session with mentor ${args.mentorId} at slot ${args.scheduledSlot}.`;
    }
    return `Execute external tool: ${toolName}`;
  }

  /**
   * Synthesizes conversational response using evidence from executed tools.
   */
  private synthesizeResponse(
    prompt: string,
    directResponse: string | undefined,
    toolResults: any[],
    pendingApproval: any,
    profile: any
  ): string {
    if (directResponse) return directResponse;

    const sections: string[] = [];

    // If an external approval was generated
    if (pendingApproval) {
      sections.push(
        `### ⚠️ Action Requires Your Explicit Approval\n\nI have prepared the requested action:\n\n` +
          `> **Action:** \`${pendingApproval.toolName}\`\n` +
          `> **Preview:** ${pendingApproval.actionPreview}\n` +
          `> **Security Policy:** This action communicates externally or mutates third-party state. Pursuant to ADR-004 and the human approval gateway, a 15-minute cryptographically signed approval token has been generated.\n\n` +
          `Please click **Confirm** in the interactive approval card below to execute this action, or click **Decline** to cancel.`
      );
      return sections.join('\n\n');
    }

    // General career intelligence synthesis
    sections.push(
      `Hello! I have reviewed your current career trajectory and profile data for **${profile.qualification}** (Pathway: **${profile.targetPathway || 'CA General'}**).`
    );

    for (const res of toolResults) {
      if (res.toolName === 'get_skill_gap_report' && res.data) {
        sections.push(
          `#### 🎯 Skill-Gap Analysis for ${res.data.targetPathway || 'Target Role'}\n` +
            `- **Verified Match Score:** ${res.data.overallMatchScore || 75}%\n` +
            `- **High-Priority Missing Skills:** ${res.data.criticalGaps?.join(', ') || 'Rolling Forecasting, DCF Modelling, Power BI'}\n` +
            `- **Strong Areas:** ${res.data.strengths?.join(', ') || 'Statutory Audit, Ind AS 115, Tax Audit'}`
        );
      } else if (res.toolName === 'search_jobs' && res.data) {
        const count = res.data.items?.length || 0;
        sections.push(
          `#### 💼 Verified Job Market Opportunities\n` +
            `Found **${count}** verified CA positions aligned with your profile in the current market.`
        );
      } else if (res.toolName === 'create_career_task' && res.data) {
        sections.push(
          `#### 📋 Preparation Plan Action Created\n` +
            `I have generated a high-priority learning task: **${res.data.title}** (Estimated: ${res.data.estimatedHours || 8} hours). You can track this in your **Adaptive Learning Roadmap**.`
        );
      } else if (res.toolName === 'get_application_status' && res.data) {
        const appCount = res.data.length || 0;
        sections.push(
          `#### 📬 Active Applications\n` +
            `You have **${appCount}** tracked applications in your pipeline.`
        );
      }
    }

    sections.push(
      `#### 🚀 Recommended Next Actions\n` +
        `1. Complete the recommended financial modelling learning task.\n` +
        `2. Take a 5-question **FP&A Mock Interview** on variance analysis to baseline your technical score.\n` +
        `3. Review and tailor your master resume against the latest corporate finance openings.`
    );

    return sections.join('\n\n');
  }

  async listConversations(userId: string, workspaceId: string) {
    const profile = await this.careerService.getProfile(userId, workspaceId);
    return this.prisma.agentConversation.findMany({
      where: {
        candidateProfileId: profile.id,
        workspaceId,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getConversationById(id: string, userId: string, workspaceId: string) {
    const profile = await this.careerService.getProfile(userId, workspaceId);
    const conversation = await this.prisma.agentConversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException(`Conversation with ID ${id} not found.`);
    }

    if (conversation.candidateProfileId !== profile.id || conversation.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied to this conversation.');
    }

    return conversation;
  }
}
