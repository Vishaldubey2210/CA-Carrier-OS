import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  MentorProfileDetail,
  MentorBookingDetail,
  CreateMentorBookingInputType,
} from '@ca-career-os/shared';
import { PrismaService } from '../prisma/prisma.service.js';
import { CURATED_MENTORS } from './mentors.data.js';

@Injectable()
export class MentorshipService {
  private readonly logger = new Logger(MentorshipService.name);
  private readonly memMentors = new Map<string, MentorProfileDetail>(); // id -> MentorProfileDetail
  private readonly memBookings = new Map<string, MentorBookingDetail>(); // id -> MentorBookingDetail

  constructor(private readonly prisma: PrismaService) {
    this.seedMentors();
  }

  private seedMentors() {
    for (const mentor of CURATED_MENTORS) {
      this.memMentors.set(mentor.id, mentor);
    }
    this.logger.log(`Initialized ${this.memMentors.size} verified CA mentors.`);
  }

  /**
   * List available mentors with optional pathway filter.
   */
  async listMentors(pathway?: string): Promise<MentorProfileDetail[]> {
    let list = Array.from(this.memMentors.values());
    if (pathway) {
      const pUpper = pathway.toUpperCase();
      list = list.filter((m) => m.pathways.includes(pUpper));
    }
    return list;
  }

  /**
   * Get mentor by ID.
   */
  async getMentorById(mentorId: string): Promise<MentorProfileDetail> {
    const mentor = this.memMentors.get(mentorId);
    if (!mentor) {
      throw new NotFoundException(`Mentor with ID ${mentorId} not found`);
    }
    return mentor;
  }

  /**
   * Reserve a 1-on-1 mentorship session with concurrency and conflict checks.
   */
  async createBooking(
    input: CreateMentorBookingInputType,
    candidateUserId: string,
    candidateWorkspaceId: string
  ): Promise<MentorBookingDetail> {
    const mentor = await this.getMentorById(input.mentorProfileId);
    if (!mentor.isAvailable) {
      throw new BadRequestException('This mentor is not currently accepting new booking sessions');
    }

    const start = new Date(input.slotStartTime).getTime();
    const end = new Date(input.slotEndTime).getTime();

    if (isNaN(start) || isNaN(end) || end <= start) {
      throw new BadRequestException('Invalid booking time interval: slotEndTime must be after slotStartTime');
    }

    if (start < Date.now()) {
      throw new BadRequestException('Cannot book mentorship slots in the past');
    }

    // Concurrency control: verify no active booking overlaps for this mentor
    const allBookings = Array.from(this.memBookings.values());
    const hasConflict = allBookings.some((b) => {
      if (b.mentorProfileId !== mentor.id || b.status === 'CANCELLED') return false;
      const bStart = new Date(b.slotStartTime).getTime();
      const bEnd = new Date(b.slotEndTime).getTime();
      return Math.max(start, bStart) < Math.min(end, bEnd);
    });

    if (hasConflict) {
      throw new ConflictException(
        'This mentor time slot is already reserved. Please select another available time.'
      );
    }

    // Check duplicate request from same candidate for same mentor at same time
    const isDuplicate = allBookings.some(
      (b) =>
        b.candidateUserId === candidateUserId &&
        b.mentorProfileId === mentor.id &&
        b.slotStartTime === input.slotStartTime &&
        b.status !== 'CANCELLED'
    );
    if (isDuplicate) {
      throw new ConflictException('You have already submitted a booking request for this exact time slot.');
    }

    const bookingId = randomUUID();
    const booking: MentorBookingDetail = {
      id: bookingId,
      mentorProfileId: mentor.id,
      candidateUserId,
      candidateWorkspaceId,
      slotStartTime: input.slotStartTime,
      slotEndTime: input.slotEndTime,
      status: 'CONFIRMED',
      sessionNotes: input.sessionNotes || null,
      feedbackRating: null,
      feedbackComments: null,
      cancelledBy: null,
      cancellationReason: null,
      createdAt: new Date().toISOString(),
    };

    this.memBookings.set(bookingId, booking);
    mentor.totalSessionsCount++;
    this.logger.log(`Created confirmed mentor booking ${bookingId} for mentor ${mentor.fullName}`);
    return booking;
  }

  /**
   * Cancel an appointment (accessible only to candidate or mentor).
   */
  async cancelBooking(
    bookingId: string,
    userId: string,
    reason?: string
  ): Promise<MentorBookingDetail> {
    const booking = this.memBookings.get(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }

    const mentor = this.memMentors.get(booking.mentorProfileId);
    const isCandidate = booking.candidateUserId === userId;
    const isMentor = mentor && mentor.userId === userId;

    if (!isCandidate && !isMentor) {
      throw new ForbiddenException('Access denied: You are not authorized to cancel this booking');
    }

    if (booking.status === 'CANCELLED') {
      throw new BadRequestException('This booking has already been cancelled');
    }

    booking.status = 'CANCELLED';
    booking.cancelledBy = isCandidate ? 'CANDIDATE' : 'MENTOR';
    booking.cancellationReason = reason || 'Cancelled by user request';

    this.logger.log(`Cancelled booking ${bookingId} by ${booking.cancelledBy}`);
    return booking;
  }

  /**
   * List candidate bookings.
   */
  async listCandidateBookings(candidateUserId: string): Promise<MentorBookingDetail[]> {
    return Array.from(this.memBookings.values()).filter(
      (b) => b.candidateUserId === candidateUserId
    );
  }

  /**
   * Submit post-session candidate feedback.
   */
  async submitFeedback(
    bookingId: string,
    userId: string,
    rating: number,
    comments?: string
  ): Promise<MentorBookingDetail> {
    const booking = this.memBookings.get(bookingId);
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found`);
    }
    if (booking.candidateUserId !== userId) {
      throw new ForbiddenException('Only the participating candidate can review this session');
    }
    if (rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be an integer between 1 and 5');
    }

    booking.feedbackRating = Math.round(rating);
    booking.feedbackComments = comments || null;
    booking.status = 'COMPLETED';

    return booking;
  }
}
