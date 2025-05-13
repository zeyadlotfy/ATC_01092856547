import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import {
  AuditLogAction,
  AuditLogEntityType,
} from '../audit-log/dtos/audit-log.interface';
import {
  BookingFeedbackDto,
  BookingQueryParamsDto,
  BookingResponseDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './dtos/booking.dto';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditLogService,
  ) {}

  /**
   * Create a new booking
   */
  async createBooking(
    userId: string,
    createBookingDto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    try {
      // Check if event exists and is published
      const event = await this.prisma.event.findFirst({
        where: {
          id: createBookingDto.eventId,
          isPublished: true,
        },
      });

      if (!event) {
        throw new NotFoundException('Event not found or not published');
      }

      // Check if event date is in the past
      if (new Date(event.startDate) < new Date()) {
        throw new BadRequestException('Cannot book past events');
      }

      // Check if user already has a booking for this event
      const existingBooking = await this.prisma.booking.findUnique({
        where: {
          userId_eventId: {
            userId,
            eventId: createBookingDto.eventId,
          },
        },
      });

      if (existingBooking) {
        throw new BadRequestException(
          'You already have a booking for this event',
        );
      }

      // Check if event has enough capacity
      if (event.maxAttendees) {
        const bookedCount = await this.prisma.booking.count({
          where: {
            eventId: createBookingDto.eventId,
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
            },
          },
        });

        const quantity = createBookingDto.quantity || 1;
        if (bookedCount + quantity > event.maxAttendees) {
          throw new BadRequestException('Event has reached maximum capacity');
        }
      }

      // Calculate total price
      const totalPrice = event.price * (createBookingDto.quantity || 1);

      // Create booking
      const booking = await this.prisma.booking.create({
        data: {
          userId,
          eventId: createBookingDto.eventId,
          status: BookingStatus.CONFIRMED,
          quantity: createBookingDto.quantity || 1,
          totalPrice,
        },
        include: {
          event: {
            include: {
              venue: true,
              category: true,
            },
          },
        },
      });

      // Log audit
      await this.auditService.logAction(
        'CREATE',
        'BOOKING',
        booking.id,
        userId,
        { eventId: booking.eventId, quantity: booking.quantity },
      );

      return booking;
    } catch (error) {
      this.logger.error(
        `Error creating booking: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all bookings (admin only)
   */
  async getAllBookings(
    queryParams: BookingQueryParamsDto,
  ): Promise<BookingResponseDto[]> {
    try {
      const whereClause: any = {};

      if (queryParams.status) {
        whereClause.status = queryParams.status;
      }

      if (queryParams.eventId) {
        whereClause.eventId = queryParams.eventId;
      }

      return await this.prisma.booking.findMany({
        where: whereClause,
        include: {
          event: {
            include: {
              venue: true,
              category: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          bookingDate: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(
        `Error fetching all bookings: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(
    userId: string,
    queryParams: BookingQueryParamsDto,
  ): Promise<BookingResponseDto[]> {
    try {
      const whereClause: any = {
        userId,
      };

      if (queryParams.status) {
        whereClause.status = queryParams.status;
      }

      if (queryParams.eventId) {
        whereClause.eventId = queryParams.eventId;
      }

      return await this.prisma.booking.findMany({
        where: whereClause,
        include: {
          event: {
            include: {
              venue: true,
              category: true,
            },
          },
        },
        orderBy: {
          bookingDate: 'desc',
        },
      });
    } catch (error) {
      this.logger.error(
        `Error fetching user bookings: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get a booking by ID
   */
  async getBookingById(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<BookingResponseDto> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          event: {
            include: {
              venue: true,
              category: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check authorization - only own bookings or admin
      if (booking.userId !== userId && userRole !== Role.ADMIN) {
        throw new ForbiddenException(
          'You are not authorized to access this booking',
        );
      }

      return booking;
    } catch (error) {
      this.logger.error(
        `Error fetching booking by id: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update a booking
   */
  async updateBooking(
    id: string,
    updateBookingDto: UpdateBookingDto,
    userId: string,
    userRole: Role,
  ): Promise<BookingResponseDto> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          event: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check authorization - only own bookings or admin
      if (booking.userId !== userId && userRole !== Role.ADMIN) {
        throw new ForbiddenException(
          'You are not authorized to update this booking',
        );
      }

      // Validate event date
      if (new Date(booking.event.startDate) < new Date()) {
        throw new BadRequestException('Cannot modify bookings for past events');
      }

      // Check if updating quantity
      if (
        updateBookingDto.quantity &&
        updateBookingDto.quantity !== booking.quantity
      ) {
        // If increasing, check capacity
        if (
          updateBookingDto.quantity > booking.quantity &&
          booking.event.maxAttendees
        ) {
          const bookedCount = await this.prisma.booking.count({
            where: {
              eventId: booking.eventId,
              status: {
                in: [BookingStatus.CONFIRMED, BookingStatus.PENDING],
              },
              id: { not: id },
            },
          });

          const additionalTickets =
            updateBookingDto.quantity - booking.quantity;
          if (
            bookedCount + booking.quantity + additionalTickets >
            booking.event.maxAttendees
          ) {
            throw new BadRequestException(
              'Cannot increase quantity - event has reached maximum capacity',
            );
          }
        }

        // Recalculate total price
        updateBookingDto['totalPrice'] =
          booking.event.price * updateBookingDto.quantity;
      }

      // Update booking
      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: updateBookingDto,
        include: {
          event: {
            include: {
              venue: true,
              category: true,
            },
          },
        },
      });

      // Log audit
      await this.auditService.logAction(
        'UPDATE',
        'BOOKING',
        id,
        userId,
        updateBookingDto,
      );

      return updatedBooking;
    } catch (error) {
      this.logger.error(
        `Error updating booking: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    id: string,
    userId: string,
    userRole: Role,
  ): Promise<BookingResponseDto> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          event: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check authorization - only own bookings or admin
      if (booking.userId !== userId && userRole !== Role.ADMIN) {
        throw new ForbiddenException(
          'You are not authorized to cancel this booking',
        );
      }

      // Check if already cancelled
      if (booking.status === BookingStatus.CANCELLED) {
        throw new BadRequestException('Booking is already cancelled');
      }

      // Check if event is in the past
      if (new Date(booking.event.startDate) < new Date()) {
        throw new BadRequestException('Cannot cancel bookings for past events');
      }

      // Cancel booking
      const cancelledBooking = await this.prisma.booking.update({
        where: { id },
        data: {
          status: BookingStatus.CANCELLED,
          cancellationDate: new Date(),
        },
        include: {
          event: {
            include: {
              venue: true,
              category: true,
            },
          },
        },
      });

      // Log audit
      await this.auditService.logAction('OTHER', 'BOOKING', id, userId, {
        previousStatus: booking.status,
      });

      return cancelledBooking;
    } catch (error) {
      this.logger.error(
        `Error cancelling booking: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Submit feedback for a booking
   */
  async submitFeedback(
    id: string,
    feedbackDto: BookingFeedbackDto,
    userId: string,
  ): Promise<BookingResponseDto> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
        include: {
          event: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Check authorization - only own bookings
      if (booking.userId !== userId) {
        throw new ForbiddenException(
          'You are not authorized to submit feedback for this booking',
        );
      }

      // Check if booking is completed
      if (booking.status !== BookingStatus.COMPLETED) {
        throw new BadRequestException(
          'Can only submit feedback for completed bookings',
        );
      }

      // Submit feedback
      const updatedBooking = await this.prisma.booking.update({
        where: { id },
        data: {
          feedback: feedbackDto.feedback,
          rating: feedbackDto.rating,
        },
        include: {
          event: {
            include: {
              venue: true,
              category: true,
            },
          },
        },
      });

      // Log audit
      await this.auditService.logAction('OTHER', 'BOOKING', id, userId, {
        rating: feedbackDto.rating,
        feedback: feedbackDto.feedback,
      });

      return updatedBooking;
    } catch (error) {
      this.logger.error(
        `Error submitting feedback: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete a booking (admin only)
   */
  async deleteBooking(id: string, adminUserId: string): Promise<void> {
    try {
      const booking = await this.prisma.booking.findUnique({
        where: { id },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      await this.prisma.booking.delete({
        where: { id },
      });

      // Log audit
      await this.auditService.logAction('DELETE', 'BOOKING', id, adminUserId, {
        eventId: booking.eventId,
        userId: booking.userId,
      });
    } catch (error) {
      this.logger.error(
        `Error deleting booking: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update booking status to completed after event
   * This would typically be called by a cron job
   */
  async completeBookingsAfterEvent(eventId: string): Promise<number> {
    try {
      const result = await this.prisma.booking.updateMany({
        where: {
          eventId,
          status: BookingStatus.CONFIRMED,
        },
        data: {
          status: BookingStatus.COMPLETED,
        },
      });

      // Log audit for each completed booking
      if (result.count > 0) {
        const completedBookings = await this.prisma.booking.findMany({
          where: {
            eventId,
            status: BookingStatus.COMPLETED,
          },
        });

        // for (const booking of completedBookings) {
        //   await this.auditService.logAction(
        // 'OTHER',
        //     AuditLogEntityType.BOOKING,
        //     booking.id,
        //     'SYSTEM',
        //     { eventId },
        //   );
        // }
      }

      return result.count;
    } catch (error) {
      this.logger.error(
        `Error completing bookings after event: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
