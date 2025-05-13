import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';

import { AuthGuard } from '../../common/gurads/auth.guard';
import { RolesGuard } from '../../common/gurads/roles.guard';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles/roles.decorator';
import { CategoryResponseDto } from './dtos/category-response.dto';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { CategoryQueryDto } from './dtos/category-query.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@ApiTags('categories')
@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly categoryService: CategoryService) {}

  /**
   * @desc    Create a new category
   * @route   POST /categories
   * @access  Private (Admin only)
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Category created successfully',
    type: CategoryResponseDto,
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    this.logger.debug('Creating new category');
    return this.categoryService.create(createCategoryDto);
  }

  /**
   * @desc    Get all categories
   * @route   GET /categories
   * @access  Public
   */
  @Get()
  @ApiOperation({ summary: 'Get all categories with pagination and filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Categories retrieved successfully',
    type: [CategoryResponseDto],
  })
  async findAll(@Query() query: CategoryQueryDto) {
    this.logger.debug('Getting all categories');
    return this.categoryService.findAll(query);
  }

  /**
   * @desc    Get category by ID
   * @route   GET /categories/:id
   * @access  Public
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category retrieved successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async findOne(@Param('id') id: string) {
    this.logger.debug(`Getting category with ID: ${id}`);
    return this.categoryService.findOne(id);
  }

  /**
   * @desc    Get category with events
   * @route   GET /categories/:id/events
   * @access  Public
   */
  @Get(':id/events')
  @ApiOperation({ summary: 'Get category with all associated events' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category with events retrieved successfully',
    type: Object,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async findOneWithEvents(@Param('id') id: string) {
    this.logger.debug(`Getting category with events for ID: ${id}`);
    return this.categoryService.findOneWithEvents(id);
  }

  /**
   * @desc    Update category
   * @route   PATCH /categories/:id
   * @access  Private (Admin only)
   */
  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category updated successfully',
    type: CategoryResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    this.logger.debug(`Updating category with ID: ${id}`);
    return this.categoryService.update(id, updateCategoryDto);
  }

  /**
   * @desc    Delete category
   * @route   DELETE /categories/:id
   * @access  Private (Admin only)
   */
  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Category not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete category with associated events',
  })
  async remove(@Param('id') id: string) {
    this.logger.debug(`Deleting category with ID: ${id}`);
    return this.categoryService.remove(id);
  }
}
