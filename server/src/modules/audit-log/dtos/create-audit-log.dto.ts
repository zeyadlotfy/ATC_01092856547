import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';
import { AuditLogAction, AuditLogEntityType } from './audit-log.interface';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'Action performed',
    example: 'CREATE',
    enum: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'READ',
      'LOGIN',
      'LOGOUT',
      'OTHER',
      'CANCEL',
      'FEEDBACK',
    ],
  })
  @IsString()
  @IsNotEmpty()
  action: AuditLogAction;

  @ApiProperty({
    description: 'Type of entity that was modified',
    example: 'USER',
    enum: [
      'USER',
      'EVENT',
      'BOOKING',
      'CATEGORY',
      'VENUE',
      'TAG',
      'SETTING',
      'CANCEL',
      'OTHER',
    ],
  })
  @IsString()
  @IsNotEmpty()
  entityType: AuditLogEntityType;

  @ApiProperty({
    description: 'ID of the entity that was modified',
    example: '60d21b4967d0d8992e610c85',
  })
  @IsString()
  @IsNotEmpty()
  entityId: string;

  @ApiProperty({
    description: 'ID of the user who performed the action',
    example: '60d21b4967d0d8992e610c85',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Additional details about the action (JSON object)',
    example: { oldValue: 'previous data', newValue: 'updated data' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  details?: Record<string, any>;

  @ApiProperty({
    description: 'IP address of the client',
    example: '192.168.1.1',
    required: false,
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent of the client',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    required: false,
  })
  @IsOptional()
  @IsString()
  userAgent?: string;
}
