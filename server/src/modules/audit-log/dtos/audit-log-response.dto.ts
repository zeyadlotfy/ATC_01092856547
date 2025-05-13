import { ApiProperty } from '@nestjs/swagger';

export class AuditLogResponseDto {
  @ApiProperty({
    description: 'Audit log ID',
    example: '60d21b4967d0d8992e610c85',
  })
  id: string;

  @ApiProperty({
    description: 'Action performed',
    example: 'CREATE',
    enum: ['CREATE', 'UPDATE', 'DELETE', 'READ', 'LOGIN', 'LOGOUT', 'OTHER'],
  })
  action: string;

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
      'OTHER',
    ],
  })
  entityType: string;

  @ApiProperty({
    description: 'ID of the entity that was modified',
    example: '60d21b4967d0d8992e610c85',
  })
  entityId: string;

  @ApiProperty({
    description: 'ID of the user who performed the action',
    example: '60d21b4967d0d8992e610c85',
  })
  userId: string;

  @ApiProperty({
    description: 'Additional details about the action (JSON object)',
    example: { oldValue: 'previous data', newValue: 'updated data' },
  })
  details?: Record<string, any>;

  @ApiProperty({
    description: 'IP address of the client',
    example: '192.168.1.1',
  })
  ipAddress?: string;

  @ApiProperty({
    description: 'User agent of the client',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent?: string;

  @ApiProperty({
    description: 'Date and time when the audit log was created',
    example: '2023-06-15T10:30:00.000Z',
  })
  createdAt: Date;
}
