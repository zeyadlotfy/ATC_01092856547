import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VenueResponseDto {
  @ApiProperty({ description: 'Unique identifier for the venue' })
  id: string;

  @ApiProperty({ description: 'Name of the venue' })
  name: string;

  @ApiPropertyOptional({ description: 'Arabic name of the venue' })
  nameAr?: string;

  @ApiProperty({ description: 'Address of the venue' })
  address: string;

  @ApiProperty({ description: 'City where the venue is located' })
  city: string;

  @ApiProperty({ description: 'Country where the venue is located' })
  country: string;

  @ApiPropertyOptional({ description: 'Maximum capacity of the venue' })
  capacity?: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
