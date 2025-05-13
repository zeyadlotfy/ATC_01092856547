import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto } from './dtos/create-audit-log.dto';
import { AuditLogResponseDto } from './dtos/audit-log-response.dto';
import { FilterAuditLogDto } from './dtos/filter-audit-log.dto';
import { AuditLogAction, AuditLogEntityType } from './dtos/audit-log.interface';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new audit log entry
   */
  async create(
    createAuditLogDto: CreateAuditLogDto,
  ): Promise<AuditLogResponseDto> {
    this.logger.debug(
      `Creating audit log entry: ${JSON.stringify(createAuditLogDto)}`,
    );

    const auditLog = await this.prisma.auditLog.create({
      data: {
        action: createAuditLogDto.action,
        entityType: createAuditLogDto.entityType,
        entityId: createAuditLogDto.entityId,
        userId: createAuditLogDto.userId,
        details: createAuditLogDto.details || {},
        ipAddress: createAuditLogDto.ipAddress,
        userAgent: createAuditLogDto.userAgent,
      },
    });

    return this.mapToDto(auditLog);
  }

  /**
   * Find all audit logs with optional filtering
   */
  async findAll(filterDto?: FilterAuditLogDto): Promise<{
    data: AuditLogResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const {
      page = 1,
      limit = 10,
      userId,
      action,
      entityType,
      entityId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto || {};

    const skip = (page - 1) * limit;

    const where: any = {};

    if (userId) where.userId = userId;
    if (action) where.action = action;
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const total = await this.prisma.auditLog.count({ where });

    const auditLogs = await this.prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });

    return {
      data: auditLogs.map((log) => this.mapToDto(log)),
      total,
      page,
      limit,
    };
  }

  /**
   * Find a specific audit log by ID
   */
  async findById(id: string): Promise<AuditLogResponseDto> {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    if (!auditLog) {
      return null;
    }

    return this.mapToDto(auditLog);
  }

  /**
   * Find audit logs for a specific entity
   */
  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<AuditLogResponseDto[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return auditLogs.map((log) => this.mapToDto(log));
  }

  /**
   * Find audit logs for a specific user
   */
  async findByUser(userId: string): Promise<AuditLogResponseDto[]> {
    const auditLogs = await this.prisma.auditLog.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return auditLogs.map((log) => this.mapToDto(log));
  }

  /**
   * Log an action (utility method for easier logging)
   */
  async logAction(
    action: AuditLogAction,
    entityType: AuditLogEntityType,
    entityId: string,
    userId: string,
    details?: any,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuditLogResponseDto> {
    return this.create({
      action,
      entityType,
      entityId,
      userId,
      details,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper method to map Prisma model to DTO
   */
  private mapToDto(auditLog: any): AuditLogResponseDto {
    return {
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      userId: auditLog.userId,
      details: auditLog.details,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      createdAt: auditLog.createdAt,
    };
  }
}
