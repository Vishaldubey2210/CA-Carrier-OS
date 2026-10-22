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
  CreateMentorBookingSchema,
  createSuccessResponse,
} from '@ca-career-os/shared';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../common/guards/workspace.guard.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { CurrentWorkspace } from '../../common/decorators/current-workspace.decorator.js';
import { MentorshipService } from './mentorship.service.js';

@Controller('api/v1/mentorship')
export class MentorshipController {
  constructor(private readonly mentorshipService: MentorshipService) {}

  /**
   * Browse verified senior CA mentors
   */
  @Get('mentors')
  async listMentors(@Query('pathway') pathway?: string) {
    const list = await this.mentorshipService.listMentors(pathway);
    return createSuccessResponse(list);
  }

  /**
   * Get single mentor profile
   */
  @Get('mentors/:id')
  async getMentor(@Param('id') id: string) {
    const mentor = await this.mentorshipService.getMentorById(id);
    return createSuccessResponse(mentor);
  }

  /**
   * Book a mentorship session (Candidate Workspace)
   */
  @Post('bookings')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async createBooking(
    @Body() body: unknown,
    @CurrentUser() user: any,
    @CurrentWorkspace() workspace: any
  ) {
    const parse = CreateMentorBookingSchema.safeParse(body);
    if (!parse.success) {
      throw new BadRequestException({
        message: 'Invalid mentor booking payload',
        errors: parse.error.errors,
      });
    }

    const booking = await this.mentorshipService.createBooking(
      parse.data,
      user.id,
      workspace.id
    );
    return createSuccessResponse(booking);
  }

  /**
   * List candidate's personal mentorship bookings
   */
  @Get('bookings')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async listBookings(@CurrentUser() user: any) {
    const list = await this.mentorshipService.listCandidateBookings(user.id);
    return createSuccessResponse(list);
  }

  /**
   * Cancel a booked mentorship session
   */
  @Post('bookings/:id/cancel')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async cancelBooking(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any
  ) {
    const res = await this.mentorshipService.cancelBooking(id, user.id, reason);
    return createSuccessResponse(res);
  }

  /**
   * Submit post-session candidate review
   */
  @Post('bookings/:id/feedback')
  @UseGuards(JwtAuthGuard, WorkspaceGuard)
  async submitFeedback(
    @Param('id') id: string,
    @Body() body: { rating: number; comments?: string },
    @CurrentUser() user: any
  ) {
    const res = await this.mentorshipService.submitFeedback(
      id,
      user.id,
      body?.rating,
      body?.comments
    );
    return createSuccessResponse(res);
  }
}
