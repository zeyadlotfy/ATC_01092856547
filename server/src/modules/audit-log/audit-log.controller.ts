import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  Logger,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AuditLogService } from './audit-log.service';
import { AuthGuard } from '../../common/gurads/auth.guard';
import { RolesGuard } from 'src/common/gurads/roles.guard';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { Role } from '@prisma/client';
import { AuditLogResponseDto } from './dtos/audit-log-response.dto';
import { CreateAuditLogDto } from './dtos/create-audit-log.dto';
import { FilterAuditLogDto } from './dtos/filter-audit-log.dto';

@ApiTags('audit-logs')
@Controller('audit-logs')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AuditLogController {
  private readonly logger = new Logger(AuditLogController.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * @desc    Create a new audit log entry (admin only)
   * @route   POST /audit-logs
   * @access  Private/Admin
   */
  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new audit log entry (admin only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Audit log created successfully',
    type: AuditLogResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
  })
  async create(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @Req() req: Request,
  ) {
    this.logger.debug(
      `Creating audit log entry: ${JSON.stringify(createAuditLogDto)}`,
    );

    const ipAddress = req.ip || '';
    const userAgent = req.headers['user-agent'] || '';

    const enrichedDto = {
      ...createAuditLogDto,
      ipAddress,
      userAgent,
    };

    return this.auditLogService.create(enrichedDto);
  }

  /**
   * @desc    Get all audit logs with filtering (admin only)
   * @route   GET /audit-logs
   * @access  Private/Admin
   */
  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all audit logs with filtering (admin only)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved audit logs successfully',
    type: [AuditLogResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
  })
  async findAll(@Query() filterDto: FilterAuditLogDto) {
    this.logger.debug(
      `Fetching audit logs with filters: ${JSON.stringify(filterDto)}`,
    );
    return this.auditLogService.findAll(filterDto);
  }

  /**
   * @desc    Get audit log by ID (admin only)
   * @route   GET /audit-logs/:id
   * @access  Private/Admin
   */
  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get audit log by ID (admin only)' })
  @ApiParam({ name: 'id', description: 'Audit log ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved audit log successfully',
    type: AuditLogResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Audit log not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
  })
  async findOne(@Param('id') id: string) {
    this.logger.debug(`Fetching audit log with ID: ${id}`);
    return this.auditLogService.findById(id);
  }

  /**
   * @desc    Get audit logs by entity (admin only)
   * @route   GET /audit-logs/entity/:type/:id
   * @access  Private/Admin
   */
  @Get('entity/:type/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get audit logs by entity (admin only)' })
  @ApiParam({ name: 'type', description: 'Entity type' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved entity audit logs successfully',
    type: [AuditLogResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
  })
  async findByEntity(
    @Param('type') entityType: string,
    @Param('id') entityId: string,
  ) {
    this.logger.debug(
      `Fetching audit logs for entity type: ${entityType}, ID: ${entityId}`,
    );
    return this.auditLogService.findByEntity(entityType, entityId);
  }

  /**
   * @desc    Get current user's audit logs
   * @route   GET /audit-logs/user/me
   * @access  Private
   */
  @Get('user/me')
  @ApiOperation({ summary: "Get current user's audit logs" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved user audit logs successfully',
    type: [AuditLogResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  async findMyLogs(@Req() req) {
    const userId = req.user['sub'];
    this.logger.debug(`Fetching audit logs for current user: ${userId}`);
    return this.auditLogService.findByUser(userId);
  }

  /**
   * @desc    Get audit logs by user ID (admin only)
   * @route   GET /audit-logs/user/:id
   * @access  Private/Admin
   */
  @Get('user/:id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get audit logs by user ID (admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Retrieved user audit logs successfully',
    type: [AuditLogResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - Admin access required',
  })
  async findByUser(@Param('id') userId: string) {
    this.logger.debug(`Fetching audit logs for user: ${userId}`);
    return this.auditLogService.findByUser(userId);
  }
}
