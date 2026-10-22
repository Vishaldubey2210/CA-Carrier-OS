import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  CAPathway,
  CreateCommunityPostSchema,
  CreateCommunityReplySchema,
  CreateCommunityReportSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CommunityService } from './community.service.js';

@Controller('api/v1/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  /**
   * Browse active community discussion posts
   */
  @Get('posts')
  async listPosts(
    @Query('pathway') pathway?: CAPathway,
    @Query('category') category?: string
  ) {
    const list = await this.communityService.listPosts(pathway, category);
    return createSuccessResponse(list);
  }

  /**
   * Get single discussion post with thread replies
   */
  @Get('posts/:id')
  async getPost(@Param('id') id: string) {
    const result = await this.communityService.getPostById(id);
    return createSuccessResponse(result);
  }

  /**
   * Create discussion post
   */
  @Post('posts')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async createPost(
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parse = CreateCommunityPostSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid community post payload',
        errors: parse.error.errors,
      });
    }

    const authorName = `${user.firstName || 'CA'} ${user.lastName || 'Member'}`.trim();
    const post = await this.communityService.createPost(parse.data, user.id, authorName);
    return createSuccessResponse(post);
  }

  /**
   * Add reply to discussion post
   */
  @Post('posts/:id/replies')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async createReply(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parse = CreateCommunityReplySchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid reply payload',
        errors: parse.error.errors,
      });
    }

    const authorName = `${user.firstName || 'CA'} ${user.lastName || 'Member'}`.trim();
    const reply = await this.communityService.createReply(id, parse.data, user.id, authorName);
    return createSuccessResponse(reply);
  }

  /**
   * Report inappropriate content or commercial solicitation
   */
  @Post('reports')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async reportContent(
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parse = CreateCommunityReportSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid report payload',
        errors: parse.error.errors,
      });
    }

    const report = await this.communityService.reportContent(parse.data, user.id);
    return createSuccessResponse(report);
  }

  /**
   * Platform Admin / Moderator: Review reported content
   */
  @Get('moderation/reports')
  @UseGuards(JwtAuthGuard)
  async listReports(@CurrentUser() user: any) {
    const reports = await this.communityService.listPendingReports();
    return createSuccessResponse(reports);
  }

  /**
   * Platform Admin / Moderator: Execute moderation decision
   */
  @Post('moderation/reports/:id/decision')
  @UseGuards(JwtAuthGuard)
  async moderateReport(
    @Param('id') id: string,
    @Body() body: { decision: 'ACTION_TAKEN' | 'DISMISSED'; notes?: string }
  ) {
    if (!['ACTION_TAKEN', 'DISMISSED'].includes(body?.decision)) {
      throw new BadRequestException('Decision must be ACTION_TAKEN or DISMISSED');
    }
    const report = await this.communityService.moderateReport(id, body.decision, body.notes);
    return createSuccessResponse(report);
  }
}
