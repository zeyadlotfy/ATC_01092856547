import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dtos/create-event.dto';
import { EventFilterDto } from './dtos/event-response.dto';
import { UpdateEventDto } from './dtos/update-event.dto';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogService: AuditLogService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  /**
   * Create a new event
   * @param createEventDto Event creation data
   * @param userId User ID of the admin creating the event
   * @returns Created event
   */
  async createEvent(createEventDto: CreateEventDto, userId: string) {
    this.logger.debug(`Creating event: ${createEventDto.title}`);

    const category = await this.prisma.category.findUnique({
      where: { id: createEventDto.categoryId },
    });
    if (!category) {
      throw new BadRequestException(
        `Category with ID ${createEventDto.categoryId} not found`,
      );
    }

    const venue = await this.prisma.venue.findUnique({
      where: { id: createEventDto.venueId },
    });
    if (!venue) {
      throw new BadRequestException(
        `Venue with ID ${createEventDto.venueId} not found`,
      );
    }

    if (createEventDto.tagIds && createEventDto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: createEventDto.tagIds } },
      });
      if (tags.length !== createEventDto.tagIds.length) {
        throw new BadRequestException('One or more tags not found');
      }
    }

    const event = await this.prisma.event.create({
      data: {
        title: createEventDto.title,
        description: createEventDto.description,
        titleAr: createEventDto.titleAr,
        descriptionAr: createEventDto.descriptionAr,
        startDate: new Date(createEventDto.startDate),
        endDate: new Date(createEventDto.endDate),
        price: createEventDto.price,
        currency: createEventDto.currency || 'USD',
        maxAttendees: createEventDto.maxAttendees,
        isPublished: createEventDto.isPublished || false,
        isHighlighted: createEventDto.isHighlighted || false,
        category: { connect: { id: createEventDto.categoryId } },
        venue: { connect: { id: createEventDto.venueId } },
        tags: createEventDto.tagIds?.length
          ? { connect: createEventDto.tagIds.map((id) => ({ id })) }
          : undefined,
      },
      include: this._getEventInclude(),
    });

    await this.auditLogService.create({
      action: 'CREATE',
      entityType: 'EVENT',
      entityId: event.id,
      userId,
      details: { eventTitle: event.title },
    });

    return this._formatEventResponse(event);
  }

  /**
   * Get all events with filtering
   * @param filterDto Filter options
   * @returns Paginated list of events
   */
  async getAllEvents(filterDto: EventFilterDto) {
    const {
      search,
      categoryId,
      venueId,
      tagIds,
      startDate,
      endDate,
      isPublished,
      isHighlighted,
      page = 1,
      limit = 10,
    } = filterDto;

    const where: Prisma.EventWhereInput = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { titleAr: { contains: search, mode: 'insensitive' } },
        { descriptionAr: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (venueId) {
      where.venueId = venueId;
    }

    if (tagIds && tagIds.length > 0) {
      where.tagIds = { hasSome: tagIds };
    }

    if (startDate) {
      where.startDate = { gte: new Date(startDate) };
    }
    if (endDate) {
      where.endDate = { lte: new Date(endDate) };
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    if (isHighlighted !== undefined) {
      where.isHighlighted = isHighlighted;
    }

    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startDate: 'asc' },
        include: this._getEventInclude(),
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      events: events.map(this._formatEventResponse),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * Get event by ID
   * @param id Event ID
   * @returns Event details
   */
  async getEventById(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: this._getEventInclude(),
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return this._formatEventResponse(event);
  }

  /**
   * Update event
   * @param id Event ID
   * @param updateEventDto Event update data
   * @param userId User ID of admin updating the event
   * @returns Updated event
   */
  async updateEvent(
    id: string,
    updateEventDto: UpdateEventDto,
    userId: string,
  ) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (updateEventDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateEventDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(
          `Category with ID ${updateEventDto.categoryId} not found`,
        );
      }
    }

    if (updateEventDto.venueId) {
      const venue = await this.prisma.venue.findUnique({
        where: { id: updateEventDto.venueId },
      });
      if (!venue) {
        throw new BadRequestException(
          `Venue with ID ${updateEventDto.venueId} not found`,
        );
      }
    }

    if (updateEventDto.tagIds && updateEventDto.tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: { id: { in: updateEventDto.tagIds } },
      });
      if (tags.length !== updateEventDto.tagIds.length) {
        throw new BadRequestException('One or more tags not found');
      }
    }

    const updateData: Prisma.EventUpdateInput = {
      title: updateEventDto.title,
      description: updateEventDto.description,
      titleAr: updateEventDto.titleAr,
      descriptionAr: updateEventDto.descriptionAr,
      startDate: updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : undefined,
      endDate: updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : undefined,
      price: updateEventDto.price,
      currency: updateEventDto.currency,
      maxAttendees: updateEventDto.maxAttendees,
      isPublished: updateEventDto.isPublished,
      isHighlighted: updateEventDto.isHighlighted,
    };

    if (updateEventDto.categoryId) {
      updateData.category = { connect: { id: updateEventDto.categoryId } };
    }

    if (updateEventDto.venueId) {
      updateData.venue = { connect: { id: updateEventDto.venueId } };
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: updateData,
      include: this._getEventInclude(),
    });

    if (updateEventDto.tagIds !== undefined) {
      await this.prisma.event.update({
        where: { id },
        data: {
          tags: {
            set: [],
          },
        },
      });

      if (updateEventDto.tagIds.length > 0) {
        await this.prisma.event.update({
          where: { id },
          data: {
            tags: {
              connect: updateEventDto.tagIds.map((tagId) => ({ id: tagId })),
            },
          },
        });
      }

      const eventWithUpdatedTags = await this.prisma.event.findUnique({
        where: { id },
        include: this._getEventInclude(),
      });

      await this.auditLogService.create({
        action: 'UPDATE',
        entityType: 'EVENT',
        entityId: id,
        userId,
        details: { eventTitle: updatedEvent.title },
      });

      return this._formatEventResponse(eventWithUpdatedTags);
    }

    await this.auditLogService.create({
      action: 'UPDATE',
      entityType: 'EVENT',
      entityId: id,
      userId,
      details: { eventTitle: updatedEvent.title },
    });

    return this._formatEventResponse(updatedEvent);
  }

  /**
   * update event image
   * @param id Event ID
   */
  async updateEventImage(id: string, image) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
    if (!image) {
      throw new BadRequestException('Invalid image format');
    }
    const buffer = await this.cloudinary.uploadFile(image);

    if (buffer) {
      if (event.ImageUrl && event.ImageUrl !== null && event.imageId) {
        await this.cloudinary.deleteFile(event.imageId);
      }
      await this.prisma.event.update({
        where: { id },
        data: {
          ImageUrl: buffer.url,
          imageId: buffer.public_id,
        },
      });
    } else {
      throw new BadRequestException('Invalid image format');
    }

    return {
      message: 'Event image updated successfully',
    };
  }
  /**
   * Delete event
   * @param id Event ID
   * @param userId User ID of admin deleting the event
   */
  async deleteEvent(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const bookingsCount = await this.prisma.booking.count({
      where: { eventId: id },
    });

    if (bookingsCount > 0) {
      throw new BadRequestException(
        `Cannot delete event with ID ${id} because it has ${bookingsCount} bookings`,
      );
    }

    if (event.ImageUrl && event.ImageUrl !== null && event.imageId) {
      await this.cloudinary.deleteFile(event.imageId);
    }

    await this.auditLogService.create({
      action: 'DELETE',
      entityType: 'EVENT',
      entityId: id,
      userId,
      details: { eventTitle: event.title },
    });

    await this.prisma.event.delete({
      where: { id },
    });
  }

  /**
   * Get highlighted events
   * @param limit Number of events to return
   * @returns Array of highlighted events
   */
  async getHighlightedEvents(limit?: number) {
    const events = await this.prisma.event.findMany({
      where: {
        isHighlighted: true,
        isPublished: true,
        startDate: { gte: new Date() },
      },
      take: limit || 5,
      orderBy: { startDate: 'asc' },
      include: this._getEventInclude(),
    });

    return events.map(this._formatEventResponse);
  }

  /**
   * Toggle event publication status
   * @param id Event ID
   * @param userId User ID of admin toggling status
   * @returns Updated event
   */
  async togglePublishStatus(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: { isPublished: !event.isPublished },
      include: this._getEventInclude(),
    });

    await this.auditLogService.create({
      action: 'UPDATE',
      entityType: 'EVENT',
      entityId: id,
      userId,
      details: {
        action: 'TOGGLE_PUBLISH',
        newStatus: updatedEvent.isPublished ? 'PUBLISHED' : 'UNPUBLISHED',
        eventTitle: event.title,
      },
    });

    return this._formatEventResponse(updatedEvent);
  }

  /**
   * Toggle event highlight status
   * @param id Event ID
   * @param userId User ID of admin toggling status
   * @returns Updated event
   */
  async toggleHighlightStatus(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: { isHighlighted: !event.isHighlighted },
      include: this._getEventInclude(),
    });

    await this.auditLogService.create({
      action: 'UPDATE',
      entityType: 'EVENT',
      entityId: id,
      userId,
      details: {
        action: 'TOGGLE_HIGHLIGHT',
        newStatus: updatedEvent.isHighlighted
          ? 'HIGHLIGHTED'
          : 'NOT_HIGHLIGHTED',
        eventTitle: event.title,
      },
    });

    return this._formatEventResponse(updatedEvent);
  }

  /**
   * Get upcoming events
   * @param limit Number of events to return
   * @returns Array of upcoming events
   */
  async getUpcomingEvents(limit?: number) {
    const events = await this.prisma.event.findMany({
      where: {
        isPublished: true,
        startDate: { gte: new Date() },
      },
      take: limit || 5,
      orderBy: { startDate: 'asc' },
      include: this._getEventInclude(),
    });

    return events.map(this._formatEventResponse);
  }

  /**
   * Helper to get consistent include object for event queries
   * @private
   */
  private _getEventInclude() {
    return {
      category: true,
      venue: true,
      tags: true,
    };
  }

  /**
   * Format event response to match EventResponseDto structure
   * @param event Raw event from database
   * @private
   */
  private _formatEventResponse(event) {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      titleAr: event.titleAr,
      descriptionAr: event.descriptionAr,
      startDate: event.startDate,
      endDate: event.endDate,
      price: event.price,
      currency: event.currency,
      imageUrl: event.ImageUrl,
      imageId: event.imageId,
      tagsIds: event.tags.map((tag) => tag.id),
      maxAttendees: event.maxAttendees,
      isPublished: event.isPublished,
      isHighlighted: event.isHighlighted,
      category: {
        id: event.category.id,
        name: event.category.name,
        nameAr: event.category.nameAr,
      },
      venue: {
        id: event.venue.id,
        name: event.venue.name,
        address: event.venue.address,
        city: event.venue.city,
        country: event.venue.country,
        nameAr: event.venue.nameAr,
      },
      tags: event.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        nameAr: tag.nameAr,
      })),
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
