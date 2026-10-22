import crypto from 'node:crypto';
import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AgentToolsRegistry, AgentExecutionContext } from './agent-tools.registry.js';

const APPROVAL_TTL_MS = 15 * 60 * 1000; // 15 minutes
const HMAC_SECRET = process.env.APPROVAL_HMAC_SECRET || 'ca-career-os-approval-secret-salt-2026';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly toolsRegistry: AgentToolsRegistry
  ) {}

  /**
   * Generates an HMAC-SHA256 signed token for a proposed sensitive tool action.
   */
  private generateSignedToken(
    executionId: string,
    userId: string,
    toolName: string,
    paramsHash: string,
    expiresAtMs: number
  ): string {
    const payload = `${executionId}:${userId}:${toolName}:${paramsHash}:${expiresAtMs}`;
    return crypto.createHmac('sha256', HMAC_SECRET).update(payload).digest('hex');
  }

  /**
   * Hashes parameters stably for tamper-proofing in token.
   */
  private hashParameters(params: Record<string, any>): string {
    return crypto.createHash('sha256').update(JSON.stringify(params)).digest('hex').substring(0, 16);
  }

  /**
   * Creates a reviewable ApprovalRequest for an EXPLICITLY_APPROVED_EXTERNAL or DESTRUCTIVE action.
   */
  async createApprovalRequest(
    userId: string,
    workspaceId: string,
    toolName: string,
    toolParameters: Record<string, any>,
    actionPreview: string
  ) {
    const executionId = crypto.randomUUID();
    const expiresAtMs = Date.now() + APPROVAL_TTL_MS;
    const expiresAt = new Date(expiresAtMs);
    const paramsHash = this.hashParameters(toolParameters);

    const signedToken = this.generateSignedToken(
      executionId,
      userId,
      toolName,
      paramsHash,
      expiresAtMs
    );

    const record = await this.prisma.approvalRequest.create({
      data: {
        executionId,
        requestedByUserId: userId,
        workspaceId,
        toolName,
        toolParameters,
        actionPreview,
        signedApprovalToken: signedToken,
        expiresAt,
        decision: 'PENDING',
      },
    });

    return {
      approvalId: record.id,
      executionId: record.executionId,
      toolName: record.toolName,
      toolParameters: record.toolParameters,
      actionPreview: record.actionPreview,
      signedApprovalToken: record.signedApprovalToken,
      expiresAt: record.expiresAt.toISOString(),
      decision: record.decision,
    };
  }

  /**
   * Evaluates a user decision (APPROVED or DECLINED) for a pending approval request.
   * If APPROVED and valid, securely dispatches the tool execution.
   */
  async processDecision(
    approvalId: string,
    decision: 'APPROVED' | 'DECLINED',
    signedToken: string,
    userCtx: AgentExecutionContext
  ) {
    const record = await this.prisma.approvalRequest.findUnique({
      where: { id: approvalId },
    });

    if (!record) {
      throw new NotFoundException(`Approval request with ID ${approvalId} not found.`);
    }

    // 1. Enforce user ownership & workspace isolation
    if (record.requestedByUserId !== userCtx.userId) {
      throw new ForbiddenException('You are not authorized to decide on this approval request.');
    }

    // 2. Prevent replay or double execution
    if (record.decision !== 'PENDING') {
      throw new BadRequestException(`Approval request has already been resolved with status: ${record.decision}`);
    }

    // 3. Enforce 15-minute TTL expiration
    if (new Date() > record.expiresAt) {
      await this.prisma.approvalRequest.update({
        where: { id: approvalId },
        data: { decision: 'EXPIRED' },
      });
      throw new BadRequestException('Approval token has expired. Please request a new action.');
    }

    // 4. Validate signed token authenticity against tampering
    const paramsHash = this.hashParameters(record.toolParameters as Record<string, any>);
    const expectedToken = this.generateSignedToken(
      record.executionId,
      record.requestedByUserId,
      record.toolName,
      paramsHash,
      record.expiresAt.getTime()
    );

    const isMatch =
      signedToken === record.signedApprovalToken &&
      crypto.timingSafeEqual(Buffer.from(signedToken), Buffer.from(expectedToken));

    if (!isMatch) {
      throw new ForbiddenException('Invalid or tampered approval token. Action aborted.');
    }

    // 5. Handle DECLINED
    if (decision === 'DECLINED') {
      const updated = await this.prisma.approvalRequest.update({
        where: { id: approvalId },
        data: {
          decision: 'DECLINED',
          decidedAt: new Date(),
        },
      });

      return {
        approvalId: updated.id,
        decision: 'DECLINED',
        executed: false,
        message: `Action '${record.toolName}' was cancelled by the user.`,
      };
    }

    // 6. Handle APPROVED -> Dispatch to tool execution
    const tool = this.toolsRegistry.getTool(record.toolName);
    if (!tool) {
      throw new NotFoundException(`Tool '${record.toolName}' is no longer registered.`);
    }

    let executionResult: any;
    try {
      executionResult = await tool.execute(record.toolParameters, userCtx);
    } catch (err: any) {
      await this.prisma.approvalRequest.update({
        where: { id: approvalId },
        data: {
          decision: 'FAILED',
          decidedAt: new Date(),
        },
      });
      throw new BadRequestException(`Execution of approved tool failed: ${err?.message || err}`);
    }

    const updated = await this.prisma.approvalRequest.update({
      where: { id: approvalId },
      data: {
        decision: 'APPROVED',
        decidedAt: new Date(),
      },
    });

    return {
      approvalId: updated.id,
      decision: 'APPROVED',
      executed: true,
      result: executionResult,
      message: `Action '${record.toolName}' successfully approved and executed.`,
    };
  }

  async getApprovalById(approvalId: string, userId: string) {
    const record = await this.prisma.approvalRequest.findUnique({
      where: { id: approvalId },
    });

    if (!record) {
      throw new NotFoundException(`Approval request not found.`);
    }

    if (record.requestedByUserId !== userId) {
      throw new ForbiddenException('Access denied to this approval request.');
    }

    return record;
  }
}
