import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VenueService } from './venue.service';
import { AuthGuard } from 'src/common/gurads/auth.guard';
import { RolesGuard } from 'src/common/gurads/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from '@prisma/client';
import { VenueResponseDto } from './dtos/venue-response.dto';
import { CreateVenueDto } from './dtos/create-venue.dto';
import { VenueQueryDto } from './dtos/venue-query.dto';
import { UpdateVenueDto } from './dtos/update-venue.dto';

@ApiTags('venues')
@Controller('venues')
export class VenueController {
  private readonly logger = new Logger(VenueController.name);

  constructor(private readonly venueService: VenueService) {}

  /**
   * @desc    Create a new venue
   * @route   POST /venues
   * @access  Private (Admin)
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new venue' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The venue has been successfully created',
    type: VenueResponseDto,
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
  async create(@Body() createVenueDto: CreateVenueDto) {
    this.logger.debug(`Creating new venue: ${createVenueDto.name}`);
    return this.venueService.create(createVenueDto);
  }

  /**
   * @desc    Get all venues
   * @route   GET /venues
   * @access  Public
   */
  @Get()
  @ApiOperation({ summary: 'Get all venues with optional filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of venues retrieved successfully',
  })
  async findAll(@Query() query: VenueQueryDto) {
    this.logger.debug('Fetching all venues with filters');
    return this.venueService.findAll(query);
  }

  /**
   * @desc    Get a venue by ID
   * @route   GET /venues/:id
   * @access  Public
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get a venue by ID' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue retrieved successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue not found',
  })
  async findOne(@Param('id') id: string) {
    this.logger.debug(`Fetching venue with ID: ${id}`);
    return this.venueService.findById(id);
  }

  /**
   * @desc    Update a venue
   * @route   PATCH /venues/:id
   * @access  Private (Admin)
   */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue updated successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue not found',
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
  async update(
    @Param('id') id: string,
    @Body() updateVenueDto: UpdateVenueDto,
  ) {
    this.logger.debug(`Updating venue with ID: ${id}`);
    return this.venueService.update(id, updateVenueDto);
  }

  /**
   * @desc    Delete a venue
   * @route   DELETE /venues/:id
   * @access  Private (Admin)
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Venue deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete venue with associated events',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden resource',
  })
  async remove(@Param('id') id: string) {
    this.logger.debug(`Deleting venue with ID: ${id}`);
    return this.venueService.remove(id);
  }

  /**
   * @desc    Get events for a venue
   * @route   GET /venues/:id/events
   * @access  Public
   */
  @Get(':id/events')
  @ApiOperation({ summary: 'Get events for a specific venue' })
  @ApiParam({ name: 'id', description: 'Venue ID' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Events retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Venue not found',
  })
  async getVenueEvents(
    @Param('id') id: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    this.logger.debug(`Fetching events for venue with ID: ${id}`);
    return this.venueService.getVenueEvents(id, page, limit);
  }
}
