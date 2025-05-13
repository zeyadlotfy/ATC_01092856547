import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Venue } from '@prisma/client';
import { CreateVenueDto } from './dtos/create-venue.dto';
import { VenueQueryDto } from './dtos/venue-query.dto';
import { UpdateVenueDto } from './dtos/update-venue.dto';

@Injectable()
export class VenueService {
  private readonly logger = new Logger(VenueService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new venue
   */
  async create(createVenueDto: CreateVenueDto): Promise<Venue> {
    this.logger.debug(`Creating new venue: ${createVenueDto.name}`);

    return this.prisma.venue.create({
      data: createVenueDto,
    });
  }

  /**
   * Find all venues with optional filtering and pagination
   */
  async findAll(query: VenueQueryDto) {
    const { name, city, country, minCapacity, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    // Build filters
    const where: any = {};

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (country) {
      where.country = { contains: country, mode: 'insensitive' };
    }

    if (minCapacity !== undefined) {
      where.capacity = { gte: minCapacity };
    }

    const [venues, totalCount] = await Promise.all([
      this.prisma.venue.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.venue.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    return {
      data: venues,
      meta: {
        totalCount,
        page,
        limit,
        totalPages,
        hasNext,
        hasPrevious,
      },
    };
  }

  /**
   * Find a venue by ID
   */
  async findById(id: string): Promise<Venue> {
    const venue = await this.prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      this.logger.warn(`Venue with ID ${id} not found`);
      throw new NotFoundException(`Venue with ID ${id} not found`);
    }

    return venue;
  }

  /**
   * Update a venue
   */
  async update(id: string, updateVenueDto: UpdateVenueDto): Promise<Venue> {
    await this.findById(id);

    this.logger.debug(`Updating venue with ID: ${id}`);

    return this.prisma.venue.update({
      where: { id },
      data: updateVenueDto,
    });
  }

  /**
   * Delete a venue
   */
  async remove(id: string): Promise<Venue> {
    await this.findById(id);

    this.logger.debug(`Deleting venue with ID: ${id}`);

    const eventsCount = await this.prisma.event.count({
      where: { venueId: id },
    });

    if (eventsCount > 0) {
      this.logger.warn(
        `Cannot delete venue with ID ${id} as it has associated events`,
      );
      throw new Error('Cannot delete venue as it has associated events');
    }

    return this.prisma.venue.delete({
      where: { id },
    });
  }

  /**
   * Get events associated with a venue
   */
  async getVenueEvents(id: string, page = 1, limit = 10) {
    await this.findById(id);

    const skip = (page - 1) * limit;

    const [events, totalCount] = await Promise.all([
      this.prisma.event.findMany({
        where: { venueId: id },
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: {
          category: true,
        },
      }),
      this.prisma.event.count({
        where: { venueId: id },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: events,
      meta: {
        totalCount,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    };
  }
}
