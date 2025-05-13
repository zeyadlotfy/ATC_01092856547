import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  Req,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { AuthGuard } from '../../common/gurads/auth.guard';
import { RolesGuard } from '../../common/gurads/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles/roles.decorator';
import { CreateEventDto } from './dtos/create-event.dto';
import {
  EventFilterDto,
  EventResponseDto,
  EventsListResponseDto,
} from './dtos/event-response.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('events')
@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private readonly eventsService: EventsService) {}

  /**
   * @desc    Create a new event
   * @route   POST /events
   * @access  Private (Admin)
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiBody({ type: CreateEventDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Event created successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  async createEvent(@Body() createEventDto: CreateEventDto, @Req() req) {
    this.logger.debug(`Creating new event: ${createEventDto.title}`);
    return this.eventsService.createEvent(createEventDto, req.user.sub);
  }

  /**
   * @desc    Get all events with filtering
   * @route   GET /events
   * @access  Public
   */
  @Get()
  @ApiOperation({ summary: 'Get all events with filtering' })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoryId', required: false, type: String })
  @ApiQuery({ name: 'venueId', required: false, type: String })
  @ApiQuery({ name: 'tagIds', required: false, type: [String] })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiQuery({ name: 'isHighlighted', required: false, type: Boolean })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Events retrieved successfully',
    type: EventsListResponseDto,
  })
  async getAllEvents(@Query() filterDto: EventFilterDto) {
    this.logger.debug('Getting all events with filters');
    return this.eventsService.getAllEvents(filterDto);
  }

  /**
   * @desc    Get event by ID
   * @route   GET /events/:id
   * @access  Public
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event retrieved successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  async getEventById(@Param('id') id: string) {
    this.logger.debug(`Getting event by ID: ${id}`);
    return this.eventsService.getEventById(id);
  }

  /**
   * @desc    Update event
   * @route   PUT /events/:id
   * @access  Private (Admin)
   */
  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiBody({ type: UpdateEventDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req,
  ) {
    this.logger.debug(`Updating event with ID: ${id}`);
    return this.eventsService.updateEvent(id, updateEventDto, req.user.sub);
  }

  /**
   * @desc    update event image
   * @route   Patch /events/image/:id
   * @access  private
   */
  @Patch('image/:id')
  @UseGuards(AuthGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update event image' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event image updated successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: { type: 'string', format: 'binary' },
      },
      required: ['image'],
    },
  })
  async updateEventImage(
    @Param('id') id: string,
    @UploadedFile() image,
    @Req() req,
  ) {
    this.logger.debug(`Updating event image for ID: ${id}`);
    return this.eventsService.updateEventImage(id, image);
  }

  /**
   * @desc    Delete event
   * @route   DELETE /events/:id
   * @access  Private (Admin)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Event deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  async deleteEvent(@Param('id') id: string, @Req() req) {
    this.logger.debug(`Deleting event with ID: ${id}`);
    await this.eventsService.deleteEvent(id, req.user.sub);
  }

  /**
   * @desc    Get highlighted events
   * @route   GET /events/highlighted
   * @access  Public
   */
  @Get('highlighted')
  @ApiOperation({ summary: 'Get highlighted events' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of events to return',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Highlighted events retrieved successfully',
    type: [EventResponseDto],
  })
  async getHighlightedEvents(@Query('limit') limit?: number) {
    this.logger.debug('Getting highlighted events');
    return this.eventsService.getHighlightedEvents(limit);
  }

  /**
   * @desc    Toggle event publication status
   * @route   PUT /events/:id/toggle-publish
   * @access  Private (Admin)
   */
  @Put(':id/toggle-publish')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle event publication status' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event publication status toggled successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  async togglePublishStatus(@Param('id') id: string, @Req() req) {
    this.logger.debug(`Toggling publish status for event ID: ${id}`);
    return this.eventsService.togglePublishStatus(id, req.user.sub);
  }

  /**
   * @desc    Toggle event highlight status
   * @route   PUT /events/:id/toggle-highlight
   * @access  Private (Admin)
   */
  @Put(':id/toggle-highlight')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle event highlight status' })
  @ApiParam({ name: 'id', description: 'Event ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Event highlight status toggled successfully',
    type: EventResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Event not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  async toggleHighlightStatus(@Param('id') id: string, @Req() req) {
    this.logger.debug(`Toggling highlight status for event ID: ${id}`);
    return this.eventsService.toggleHighlightStatus(id, req.user.sub);
  }

  /**
   * @desc    Get upcoming events
   * @route   GET /events/upcoming
   * @access  Public
   */
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming events' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of events to return',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Upcoming events retrieved successfully',
    type: [EventResponseDto],
  })
  async getUpcomingEvents(@Query('limit') limit?: number) {
    this.logger.debug('Getting upcoming events');
    return this.eventsService.getUpcomingEvents(limit);
  }
}
