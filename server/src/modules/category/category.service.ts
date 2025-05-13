import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { CategoryQueryDto } from './dtos/category-query.dto';
import { UpdateCategoryDto } from './dtos/update-category.dto';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new category
   */
  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.debug(`Creating new category: ${createCategoryDto.name}`);

    const category = await this.prisma.category.create({
      data: createCategoryDto,
    });

    return category;
  }

  /**
   * Find all categories with pagination and search
   */
  async findAll(query: CategoryQueryDto) {
    const { search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { nameAr: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where: whereClause }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find category by ID
   */
  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      this.logger.warn(`Category with ID ${id} not found`);
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Get category with related events
   */
  async findOneWithEvents(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        events: {
          where: { isPublished: true },
          orderBy: { startDate: 'asc' },
        },
      },
    });

    if (!category) {
      this.logger.warn(`Category with ID ${id} not found`);
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  /**
   * Update category by ID
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);

    this.logger.debug(`Updating category with ID: ${id}`);

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
    });
  }

  /**
   * Delete category by ID
   */
  async remove(id: string) {
    await this.findOne(id);

    this.logger.debug(`Deleting category with ID: ${id}`);

    const eventsCount = await this.prisma.event.count({
      where: { categoryId: id },
    });

    if (eventsCount > 0) {
      this.logger.warn(
        `Cannot delete category with ID ${id} as it has ${eventsCount} associated events`,
      );
      throw new Error(
        `Cannot delete category with ID ${id} as it has ${eventsCount} associated events. Please reassign or delete these events first.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
