import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsDateString,
  IsEnum,
  IsNumber,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AuditLogAction, AuditLogEntityType } from './audit-log.interface';

export class FilterAuditLogDto {
  @ApiProperty({
    description: 'Filter by user ID',
    required: false,
    example: '60d21b4967d0d8992e610c85',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({
    description: 'Filter by action type',
    required: false,
    enum: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'READ',
      'LOGIN',
      'LOGOUT',
      'OTHER',
      'CANCEL',
    ],
  })
  @IsOptional()
  @IsEnum([
    'CREATE',
    'UPDATE',
    'DELETE',
    'READ',
    'LOGIN',
    'LOGOUT',
    'OTHER',
    'CANCEL',
    'FEEDBACK',
  ])
  action?: AuditLogAction;

  @ApiProperty({
    description: 'Filter by entity type',
    required: false,
    enum: [
      'USER',
      'EVENT',
      'BOOKING',
      'CATEGORY',
      'VENUE',
      'TAG',
      'SETTING',
      'OTHER',
    ],
  })
  @IsOptional()
  @IsEnum([
    'USER',
    'EVENT',
    'BOOKING',
    'CATEGORY',
    'VENUE',
    'TAG',
    'SETTING',
    'OTHER',
  ])
  entityType?: AuditLogEntityType;

  @ApiProperty({
    description: 'Filter by entity ID',
    required: false,
    example: '60d21b4967d0d8992e610c85',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({
    description: 'Start date for filtering (ISO format)',
    required: false,
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date for filtering (ISO format)',
    required: false,
    example: '2023-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Field to sort by',
    required: false,
    example: 'createdAt',
    default: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'action', 'entityType', 'userId'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
