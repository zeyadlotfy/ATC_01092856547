import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TagService } from './tag.service';

import { Role } from '@prisma/client';
import { AuthGuard } from '../../common/gurads/auth.guard';
import { RolesGuard } from '../../common/gurads/roles.guard';
import { Roles } from '../../common/decorators/roles/roles.decorator';
import {
  CreateTagDto,
  TagListResponseDto,
  TagResponseDto,
  UpdateTagDto,
} from './dtos/tag.dto';

@ApiTags('tags')
@Controller('tags')
export class TagController {
  private readonly logger = new Logger(TagController.name);

  constructor(private readonly tagService: TagService) {}

  /**
   * @desc    Create a new tag
   * @route   POST /tags
   * @access  Private (Admin only)
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new tag' })
  @ApiBody({ type: CreateTagDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tag created successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data or tag already exists',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  async createTag(@Body() createTagDto: CreateTagDto): Promise<TagResponseDto> {
    this.logger.debug(`Creating new tag: ${createTagDto.name}`);
    return this.tagService.createTag(createTagDto);
  }

  /**
   * @desc    Get all tags
   * @route   GET /tags
   * @access  Public
   */
  @Get()
  @ApiOperation({ summary: 'Get all tags' })
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
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tags retrieved successfully',
    type: TagListResponseDto,
  })
  async getAllTags(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<TagListResponseDto> {
    this.logger.debug('Fetching all tags');
    return this.tagService.getAllTags({ page, limit, search });
  }

  /**
   * @desc    Get tag by ID
   * @route   GET /tags/:id
   * @access  Public
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get tag by ID' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag retrieved successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag not found',
  })
  async getTagById(@Param('id') id: string): Promise<TagResponseDto> {
    this.logger.debug(`Fetching tag with ID: ${id}`);
    return this.tagService.getTagById(id);
  }

  /**
   * @desc    Update tag
   * @route   PUT /tags/:id
   * @access  Private (Admin only)
   */
  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiBody({ type: UpdateTagDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag updated successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  async updateTag(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    this.logger.debug(`Updating tag with ID: ${id}`);
    return this.tagService.updateTag(id, updateTagDto);
  }

  /**
   * @desc    Delete tag
   * @route   DELETE /tags/:id
   * @access  Private (Admin only)
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a tag' })
  @ApiParam({ name: 'id', description: 'Tag ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized access',
  })
  async deleteTag(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.debug(`Deleting tag with ID: ${id}`);
    await this.tagService.deleteTag(id);
    return { message: 'Tag deleted successfully' };
  }
}
