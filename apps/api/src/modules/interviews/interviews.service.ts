import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  CAPathway,
  CreateInterviewSessionInputType,
  InterviewQuestionSessionItem,
  InterviewSessionDetail,
  InterviewSessionStatus,
  QuestionBankItem,
  QuestionDifficulty,
  SubmitAnswerInput,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { CareerService } from '../career/career.service.js';
import { CA_QUESTION_BANK } from './question-bank.data.js';
import {
  aggregateSessionFeedback,
  evaluateAnswer,
} from './interview-evaluator.engine.js';

@Injectable()
export class InterviewsService {
  private readonly logger = new Logger(InterviewsService.name);

  // In-memory fallback stores
  private readonly memSessions = new Map<string, InterviewSessionDetail>(); // sessionId -> InterviewSessionDetail

  constructor(
    private readonly prisma: PrismaService,
    private readonly careerService: CareerService
  ) {}

  /**
   * Browse and filter technical question bank.
   */
  async listQuestions(
    pathway?: CAPathway,
    difficulty?: QuestionDifficulty,
    query?: string
  ): Promise<QuestionBankItem[]> {
    let list = [...CA_QUESTION_BANK];

    if (pathway) {
      list = list.filter(q => q.pathway === pathway);
    }
    if (difficulty) {
      list = list.filter(q => q.difficulty === difficulty);
    }
    if (query) {
      const qLower = query.toLowerCase();
      list = list.filter(
        q =>
          q.question.toLowerCase().includes(qLower) ||
          q.topic.toLowerCase().includes(qLower) ||
          q.domain.toLowerCase().includes(qLower)
      );
    }

    return list;
  }

  /**
   * Create an interactive mock interview session.
   */
  async createSession(
    input: CreateInterviewSessionInputType,
    userId: string,
    workspaceId: string
  ): Promise<InterviewSessionDetail> {
    let pool = CA_QUESTION_BANK.filter(q => q.pathway === input.targetPathway);
    if (pool.length === 0) {
      pool = CA_QUESTION_BANK;
    }

    const topicMatches = pool.filter(q =>
      q.topic.toLowerCase().includes(input.topic.toLowerCase())
    );
    const selectedQuestions = topicMatches.length > 0 ? topicMatches : pool;

    const count = Math.min(input.questionCount || 3, selectedQuestions.length);
    const sessionQuestions: InterviewQuestionSessionItem[] = selectedQuestions
      .slice(0, count)
      .map((q, idx) => ({
        id: randomUUID(),
        questionText: q.question,
        domain: q.domain,
        topic: q.topic,
        difficulty: q.difficulty,
        candidateAnswer: null,
        score: null,
        evaluation: null,
        orderIndex: idx,
      }));

    const sessionId = randomUUID();
    const now = new Date().toISOString();

    const newSession: InterviewSessionDetail = {
      id: sessionId,
      candidateProfileId: userId,
      workspaceId,
      targetPathway: input.targetPathway,
      targetRole: input.targetRole,
      topic: input.topic,
      difficulty: input.difficulty || 'INTERMEDIATE',
      status: 'IN_PROGRESS',
      questions: sessionQuestions,
      overallScore: null,
      feedback: null,
      createdAt: now,
      completedAt: null,
    };

    this.memSessions.set(sessionId, newSession);
    this.logger.log(`Created interview session ${sessionId} for user ${userId} in pathway ${input.targetPathway}`);
    return newSession;
  }

  /**
   * Submit candidate answer for a specific question.
   */
  async submitAnswer(
    sessionId: string,
    input: SubmitAnswerInput,
    userId: string
  ): Promise<InterviewQuestionSessionItem> {
    const session = await this.getSessionById(sessionId, userId);

    if (session.status === 'COMPLETED' || session.status === 'CANCELLED') {
      throw new BadRequestException(`Cannot submit answers to a session with status ${session.status}`);
    }

    const questionItem = session.questions.find(q => q.id === input.questionId);
    if (!questionItem) {
      throw new NotFoundException(`Question with ID ${input.questionId} not found in this session`);
    }

    // Match with reference question bank item for rubric evaluation
    const refQuestion =
      CA_QUESTION_BANK.find(q => q.question === questionItem.questionText) ||
      CA_QUESTION_BANK[0];

    const evaluation = evaluateAnswer(refQuestion, input.answer);

    questionItem.candidateAnswer = input.answer;
    questionItem.score = evaluation.score;
    questionItem.evaluation = evaluation;

    return questionItem;
  }

  /**
   * Conclude and evaluate complete interview session; triggers adaptive learning tasks.
   */
  async evaluateSession(
    sessionId: string,
    userId: string,
    workspaceId: string
  ): Promise<InterviewSessionDetail> {
    const session = await this.getSessionById(sessionId, userId);

    const { overallScore, feedback } = aggregateSessionFeedback(
      session.questions,
      session.targetPathway
    );

    session.status = 'COMPLETED';
    session.overallScore = overallScore;
    session.feedback = feedback;
    session.completedAt = new Date().toISOString();

    // Trigger Adaptive Learning: Connect weak topics directly to candidate's roadmap
    try {
      const roadmap = await this.careerService.getRoadmap(userId, workspaceId);
      if (roadmap && feedback.recommendedLearningTasks.length > 0) {
        for (const taskText of feedback.recommendedLearningTasks) {
          const alreadyExists = roadmap.tasks.some(t => t.title.toLowerCase() === taskText.toLowerCase());
          if (!alreadyExists) {
            roadmap.tasks.push({
              id: randomUUID(),
              roadmapId: roadmap.id,
              milestone: 'DAY_30',
              title: taskText,
              description: `Adaptive learning task generated from Mock Interview (${session.topic}) scoring ${overallScore}/100`,
              category: 'SKILL_UPGRADE',
              priority: 'HIGH',
              status: 'PENDING',
            });
          }
        }
      }
    } catch {
      // In-memory fallback if candidate has not initialized career roadmap
    }

    this.logger.log(`Concluded and evaluated interview session ${sessionId} (Score: ${overallScore}/100)`);
    return session;
  }

  /**
   * Get single interview session with candidate ownership verification.
   */
  async getSessionById(sessionId: string, userId: string): Promise<InterviewSessionDetail> {
    const session = this.memSessions.get(sessionId);
    if (!session) {
      throw new NotFoundException(`Interview session with ID ${sessionId} not found`);
    }

    // Candidate Blindfold check: access limited strictly to the owner
    if (session.candidateProfileId !== userId) {
      throw new ForbiddenException('Access denied: You cannot view interview sessions belonging to another candidate');
    }

    return session;
  }

  /**
   * List interview history for candidate.
   */
  async listSessions(userId: string): Promise<InterviewSessionDetail[]> {
    const list = Array.from(this.memSessions.values()).filter(
      s => s.candidateProfileId === userId
    );
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
}
