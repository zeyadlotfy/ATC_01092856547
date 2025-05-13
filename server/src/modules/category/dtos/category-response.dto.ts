import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: '6448c7dd34521a4d10c30f3a',
  })
  id: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Concert',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Category description',
    example: 'Live music performances',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Category name in Arabic',
    example: 'حفلة موسيقية',
  })
  nameAr?: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-04-26T09:12:45.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-04-26T09:12:45.000Z',
  })
  updatedAt: Date;
}
