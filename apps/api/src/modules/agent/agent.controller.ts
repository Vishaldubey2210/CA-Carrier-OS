import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  AgentChatSchema,
  ApprovalDecisionSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { AgentOrchestratorService } from './agent-orchestrator.service.js';
import { ApprovalsService } from './approvals.service.js';
import { AgentExecutionContext } from './agent-tools.registry.js';

@Controller('api/v1')
export class AgentController {
  constructor(
    private readonly orchestratorService: AgentOrchestratorService,
    private readonly approvalsService: ApprovalsService
  ) {}

  /**
   * Converse with AI Career Agent (Context-Aware & Permission-Gated)
   */
  @Post('agent/chat')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async chat(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parseResult = AgentChatSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Invalid agent chat payload',
        errors: parseResult.error.errors,
      });
    }

    const context: AgentExecutionContext = {
      userId: user.id,
      workspaceId: workspace.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || 'Candidate',
        lastName: user.lastName || '',
      },
    };

    const response = await this.orchestratorService.handleChat(parseResult.data, context);
    return createSuccessResponse(response);
  }

  /**
   * List past agent conversations
   */
  @Get('agent/conversations')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listConversations(
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const list = await this.orchestratorService.listConversations(user.id, workspace.id);
    return createSuccessResponse(list);
  }

  /**
   * Get single conversation details with messages
   */
  @Get('agent/conversations/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async getConversation(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const conv = await this.orchestratorService.getConversationById(id, user.id, workspace.id);
    return createSuccessResponse(conv);
  }

  /**
   * Human-in-the-Loop Gateway: Confirm proposed sensitive/external action
   */
  @Post(['approvals/:id/confirm', 'agent/approvals/:id/confirm'])
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async confirmApproval(
    @Param('id') id: string,
    @Body() body: { signedApprovalToken?: string },
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const token = body?.signedApprovalToken;
    if (!token) {
      throw new BadRequestException('Signed approval token is required.');
    }

    const context: AgentExecutionContext = {
      userId: user.id,
      workspaceId: workspace.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || 'Candidate',
        lastName: user.lastName || '',
      },
    };

    const result = await this.approvalsService.processDecision(
      id,
      'APPROVED',
      token,
      context
    );

    return createSuccessResponse(result);
  }

  /**
   * Human-in-the-Loop Gateway: Decline proposed action
   */
  @Post(['approvals/:id/decline', 'agent/approvals/:id/decline'])
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async declineApproval(
    @Param('id') id: string,
    @Body() body: { signedApprovalToken?: string },
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const token = body?.signedApprovalToken;
    if (!token) {
      throw new BadRequestException('Signed approval token is required.');
    }

    const context: AgentExecutionContext = {
      userId: user.id,
      workspaceId: workspace.id,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName || 'Candidate',
        lastName: user.lastName || '',
      },
    };

    const result = await this.approvalsService.processDecision(
      id,
      'DECLINED',
      token,
      context
    );

    return createSuccessResponse(result);
  }

  /**
   * Check status of an approval request
   */
  @Get(['approvals/:id', 'agent/approvals/:id'])
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async getApproval(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const req = await this.approvalsService.getApprovalById(id, user.id);
    return createSuccessResponse(req);
  }
}
