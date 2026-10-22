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
  CreateInterviewSessionInputType,
  CreateInterviewSessionSchema,
  QuestionDifficulty,
  SubmitAnswerInputType,
  SubmitAnswerSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { InterviewsService } from './interviews.service.js';

@Controller('api/v1/interviews')
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  /**
   * Browse technical question bank
   */
  @Get('questions')
  async listQuestions(
    @Query('pathway') pathway?: CAPathway,
    @Query('difficulty') difficulty?: QuestionDifficulty,
    @Query('query') query?: string
  ) {
    const questions = await this.interviewsService.listQuestions(pathway, difficulty, query);
    return createSuccessResponse(questions);
  }

  /**
   * Create interactive mock interview session
   */
  @Post('sessions')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async createSession(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parseResult = CreateInterviewSessionSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for interview session configuration',
        errors: parseResult.error.errors,
      });
    }
    const session = await this.interviewsService.createSession(
      parseResult.data,
      user.id,
      workspace.id
    );
    return createSuccessResponse(session);
  }

  /**
   * List interview session history
   */
  @Get('sessions')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listSessions(@CurrentUser() user: any) {
    const sessions = await this.interviewsService.listSessions(user.id);
    return createSuccessResponse(sessions);
  }

  /**
   * Get single interview session by ID
   */
  @Get('sessions/:id')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async getSessionById(
    @Param('id') id: string,
    @CurrentUser() user: any
  ) {
    const session = await this.interviewsService.getSessionById(id, user.id);
    return createSuccessResponse(session);
  }

  /**
   * Submit answer to a specific question
   */
  @Post('sessions/:id/answers')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async submitAnswer(
    @Param('id') id: string,
    @Body() body: unknown,
    @CurrentUser() user: any
  ) {
    const parseResult = SubmitAnswerSchema.safeParse(body);
    if (!parseResult.success) {
      throw new BadRequestException({
        message: 'Validation failed for answer submission',
        errors: parseResult.error.errors,
      });
    }
    const item = await this.interviewsService.submitAnswer(id, parseResult.data, user.id);
    return createSuccessResponse(item);
  }

  /**
   * Conclude and evaluate complete interview session
   */
  @Post('sessions/:id/evaluate')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async evaluateSession(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const session = await this.interviewsService.evaluateSession(id, user.id, workspace.id);
    return createSuccessResponse(session);
  }
}
