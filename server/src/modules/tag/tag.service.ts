import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTagDto,
  TagListResponseDto,
  TagResponseDto,
  UpdateTagDto,
} from './dtos/tag.dto';

@Injectable()
export class TagService {
  private readonly logger = new Logger(TagService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new tag
   * @param createTagDto Data to create tag
   */
  async createTag(createTagDto: CreateTagDto): Promise<TagResponseDto> {
    try {
      const existingTag = await this.prisma.tag.findUnique({
        where: { name: createTagDto.name },
      });

      if (existingTag) {
        throw new ConflictException(
          `Tag with name "${createTagDto.name}" already exists`,
        );
      }

      const tag = await this.prisma.tag.create({
        data: createTagDto,
      });

      this.logger.debug(`Tag created with ID: ${tag.id}`);
      return tag;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      this.logger.error(`Error creating tag: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get all tags with pagination and search
   * @param options Pagination and search options
   */
  async getAllTags(options: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<TagListResponseDto> {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    try {
      const where: Prisma.TagWhereInput = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { nameAr: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [tags, total] = await Promise.all([
        this.prisma.tag.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.tag.count({ where }),
      ]);

      this.logger.debug(`Retrieved ${tags.length} tags (total: ${total})`);
      return {
        data: tags,
        total,
      };
    } catch (error) {
      this.logger.error(`Error fetching tags: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get tag by ID
   * @param id Tag ID
   */
  async getTagById(id: string): Promise<TagResponseDto> {
    try {
      const tag = await this.prisma.tag.findUnique({
        where: { id },
      });

      if (!tag) {
        throw new NotFoundException(`Tag with ID "${id}" not found`);
      }

      return tag;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(
        `Error fetching tag with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Update tag
   * @param id Tag ID
   * @param updateTagDto Data to update tag
   */
  async updateTag(
    id: string,
    updateTagDto: UpdateTagDto,
  ): Promise<TagResponseDto> {
    try {
      await this.getTagById(id);

      if (updateTagDto.name) {
        const existingTag = await this.prisma.tag.findFirst({
          where: {
            name: updateTagDto.name,
            id: { not: id },
          },
        });

        if (existingTag) {
          throw new ConflictException(
            `Tag with name "${updateTagDto.name}" already exists`,
          );
        }
      }

      const updatedTag = await this.prisma.tag.update({
        where: { id },
        data: updateTagDto,
      });

      this.logger.debug(`Tag with ID ${id} updated successfully`);
      return updatedTag;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Error updating tag with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Delete tag
   * @param id Tag ID
   */
  async deleteTag(id: string): Promise<void> {
    try {
      await this.getTagById(id);

      const eventsWithTag = await this.prisma.event.count({
        where: {
          tagIds: {
            has: id,
          },
        },
      });

      if (eventsWithTag > 0) {
        throw new ConflictException(
          `Cannot delete tag with ID "${id}" because it is associated with ${eventsWithTag} events`,
        );
      }

      await this.prisma.tag.delete({
        where: { id },
      });

      this.logger.debug(`Tag with ID ${id} deleted successfully`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      this.logger.error(
        `Error deleting tag with ID ${id}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
