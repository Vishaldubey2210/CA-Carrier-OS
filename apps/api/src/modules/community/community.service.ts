import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CAPathway,
  CommunityPostDetail,
  CommunityReplyDetail,
  CommunityReportDetail,
  CreateCommunityPostInputType,
  CreateCommunityReplyInputType,
  CreateCommunityReportInputType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class CommunityService {
  private readonly logger = new Logger(CommunityService.name);
  private readonly memPosts = new Map<string, CommunityPostDetail>();
  private readonly memReplies = new Map<string, CommunityReplyDetail[]>(); // postId -> replies
  private readonly memReports = new Map<string, CommunityReportDetail>();

  constructor(private readonly prisma: PrismaService) {
    // Zero fake seed posts - community posts are created by genuine users
  }

  /**
   * List active community discussions with optional pathway/category filtering.
   */
  async listPosts(pathway?: CAPathway, category?: string): Promise<CommunityPostDetail[]> {
    let list = Array.from(this.memPosts.values()).filter((p) => p.status === 'ACTIVE');
    if (pathway) {
      list = list.filter((p) => p.pathway === pathway);
    }
    if (category) {
      list = list.filter((p) => p.category === category);
    }
    return list;
  }

  /**
   * Get single discussion post with replies.
   */
  async getPostById(postId: string): Promise<{ post: CommunityPostDetail; replies: CommunityReplyDetail[] }> {
    const post = this.memPosts.get(postId);
    if (!post || post.status === 'REMOVED') {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }
    const replies = (this.memReplies.get(postId) || []).filter((r) => r.status === 'ACTIVE');
    return { post, replies };
  }

  /**
   * Create discussion post with non-solicitation checks.
   */
  async createPost(
    input: CreateCommunityPostInputType,
    userId: string,
    authorName: string
  ): Promise<CommunityPostDetail> {
    const lower = `${input.title} ${input.content}`.toLowerCase();
    // Non-solicitation ethics boundary (Clause 6/7 ICAI Code of Ethics)
    const solicitationRegex = /(hire me.*audit|cheap.*itr|tax.*discount|lowest fee|audit cheap rates|filing services for just|guaranteed refund)/i;
    if (solicitationRegex.test(lower)) {
      throw new BadRequestException(
        'Professional Ethics Boundary: Public commercial solicitation or advertising of CA services is prohibited under the ICAI Code of Ethics.'
      );
    }

    const postId = randomUUID();
    const post: CommunityPostDetail = {
      id: postId,
      authorUserId: userId,
      authorName: input.isAnonymous ? 'Anonymous CA Member' : authorName,
      pathway: input.pathway,
      title: input.title,
      content: input.content,
      category: input.category,
      isAnonymous: input.isAnonymous,
      status: 'ACTIVE',
      upvotesCount: 0,
      repliesCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.memPosts.set(postId, post);
    this.memReplies.set(postId, []);
    return post;
  }

  /**
   * Add reply to discussion post.
   */
  async createReply(
    postId: string,
    input: CreateCommunityReplyInputType,
    userId: string,
    authorName: string
  ): Promise<CommunityReplyDetail> {
    const post = this.memPosts.get(postId);
    if (!post || post.status === 'REMOVED') {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const replyId = randomUUID();
    const reply: CommunityReplyDetail = {
      id: replyId,
      postId,
      authorUserId: userId,
      authorName: input.isAnonymous ? 'Anonymous Member' : authorName,
      content: input.content,
      isAnonymous: input.isAnonymous,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    const replies = this.memReplies.get(postId) || [];
    replies.push(reply);
    this.memReplies.set(postId, replies);
    post.repliesCount++;

    return reply;
  }

  /**
   * Report inappropriate or abusive content.
   */
  async reportContent(
    input: CreateCommunityReportInputType,
    userId: string
  ): Promise<CommunityReportDetail> {
    const reportId = randomUUID();
    const report: CommunityReportDetail = {
      id: reportId,
      reportedByUserId: userId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      reason: input.reason,
      status: 'PENDING_REVIEW',
      moderatorNotes: input.notes || null,
      createdAt: new Date().toISOString(),
    };

    this.memReports.set(reportId, report);

    // If reported for spam or harassment, auto-flag post for review
    if (input.resourceType === 'POST') {
      const post = this.memPosts.get(input.resourceId);
      if (post) {
        post.status = 'FLAGGED_MODERATION';
      }
    }

    this.logger.log(`Created moderation report ${reportId} for ${input.resourceType} ${input.resourceId}`);
    return report;
  }

  /**
   * Moderator review queue action (Platform Admin / Moderator).
   */
  async moderateReport(
    reportId: string,
    decision: 'ACTION_TAKEN' | 'DISMISSED',
    moderatorNotes?: string
  ): Promise<CommunityReportDetail> {
    const report = this.memReports.get(reportId);
    if (!report) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }

    report.status = decision;
    report.moderatorNotes = moderatorNotes || null;

    if (decision === 'ACTION_TAKEN' && report.resourceType === 'POST') {
      const post = this.memPosts.get(report.resourceId);
      if (post) post.status = 'REMOVED';
    } else if (decision === 'DISMISSED' && report.resourceType === 'POST') {
      const post = this.memPosts.get(report.resourceId);
      if (post && post.status === 'FLAGGED_MODERATION') post.status = 'ACTIVE';
    }

    return report;
  }

  /**
   * List pending moderation reports.
   */
  async listPendingReports(): Promise<CommunityReportDetail[]> {
    return Array.from(this.memReports.values()).filter((r) => r.status === 'PENDING_REVIEW');
  }
}
