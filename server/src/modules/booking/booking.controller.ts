import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../common/gurads/auth.guard';
import { BookingService } from './booking.service';
import { Role } from '@prisma/client';
import { RolesGuard } from '../../common/gurads/roles.guard';
import {
  BookingFeedbackDto,
  BookingQueryParamsDto,
  BookingResponseDto,
  CreateBookingDto,
  UpdateBookingDto,
} from './dtos/booking.dto';
import { Roles } from 'src/common/decorators/roles/roles.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class BookingController {
  private readonly logger = new Logger(BookingController.name);

  constructor(private readonly bookingService: BookingService) {}

  /**
   * @desc    Create a new booking
   * @route   POST /bookings
   * @access  Private
   */
  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Booking created successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or booking already exists',
  })
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Req() req,
  ): Promise<BookingResponseDto> {
    this.logger.debug(
      `Creating booking for user: ${req.user.sub}, event: ${createBookingDto.eventId}`,
    );
    return this.bookingService.createBooking(req.user.sub, createBookingDto);
  }

  /**
   * @desc    Get all bookings (admin only)
   * @route   GET /bookings/all
   * @access  Admin
   */
  @Get('all')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Get all bookings (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Bookings retrieved successfully',
    type: [BookingResponseDto],
  })
  async getAllBookings(
    @Query() queryParams: BookingQueryParamsDto,
  ): Promise<BookingResponseDto[]> {
    this.logger.debug('Admin retrieving all bookings');
    return this.bookingService.getAllBookings(queryParams);
  }

  /**
   * @desc    Get user's bookings
   * @route   GET /bookings
   * @access  Private
   */
  @Get()
  @ApiOperation({ summary: "Get user's bookings" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User bookings retrieved successfully',
    type: [BookingResponseDto],
  })
  async getUserBookings(
    @Req() req,
    @Query() queryParams: BookingQueryParamsDto,
  ): Promise<BookingResponseDto[]> {
    this.logger.debug(`Retrieving bookings for user: ${req.user.sub}`);
    return this.bookingService.getUserBookings(req.user.sub, queryParams);
  }

  /**
   * @desc    Get a booking by ID
   * @route   GET /bookings/:id
   * @access  Private
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a booking by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking retrieved successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  async getBookingById(
    @Param('id') id: string,
    @Req() req,
  ): Promise<BookingResponseDto> {
    this.logger.debug(`Retrieving booking: ${id}`);
    return this.bookingService.getBookingById(id, req.user.sub, req.user.role);
  }

  /**
   * @desc    Update a booking
   * @route   PATCH /bookings/:id
   * @access  Private
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking updated successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  async updateBooking(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
    @Req() req,
  ): Promise<BookingResponseDto> {
    this.logger.debug(`Updating booking: ${id}`);
    return this.bookingService.updateBooking(
      id,
      updateBookingDto,
      req.user.sub,
      req.user.role,
    );
  }

  /**
   * @desc    Cancel a booking
   * @route   PATCH /bookings/:id/cancel
   * @access  Private
   */
  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Booking cancelled successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  async cancelBooking(
    @Param('id') id: string,
    @Req() req,
  ): Promise<BookingResponseDto> {
    this.logger.debug(`Cancelling booking: ${id}`);
    return this.bookingService.cancelBooking(id, req.user.sub, req.user.role);
  }

  /**
   * @desc    Submit feedback for a booking
   * @route   PATCH /bookings/:id/feedback
   * @access  Private
   */
  @Patch(':id/feedback')
  @ApiOperation({ summary: 'Submit feedback for a booking' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Feedback submitted successfully',
    type: BookingResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  async submitFeedback(
    @Param('id') id: string,
    @Body() feedbackDto: BookingFeedbackDto,
    @Req() req,
  ): Promise<BookingResponseDto> {
    this.logger.debug(`Submitting feedback for booking: ${id}`);
    return this.bookingService.submitFeedback(id, feedbackDto, req.user.sub);
  }

  /**
   * @desc    Delete a booking (admin only)
   * @route   DELETE /bookings/:id
   * @access  Admin
   */
  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a booking (admin only)' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Booking deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Booking not found',
  })
  async deleteBooking(@Param('id') id: string, @Req() req): Promise<void> {
    this.logger.debug(`Admin deleting booking: ${id}`);
    return this.bookingService.deleteBooking(id, req.user.sub);
  }
}
