import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateTagDto {
  @ApiProperty({ description: 'Tag name in English', example: 'Music' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({ description: 'Tag name in Arabic', example: 'موسيقى' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nameAr?: string;
}

export class UpdateTagDto {
  @ApiPropertyOptional({ description: 'Tag name in English', example: 'Music' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ description: 'Tag name in Arabic', example: 'موسيقى' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  nameAr?: string;
}

export class TagResponseDto {
  @ApiProperty({ description: 'Tag ID', example: '60d21b4667d0d8992e610c85' })
  id: string;

  @ApiProperty({ description: 'Tag name in English', example: 'Music' })
  name: string;

  @ApiPropertyOptional({ description: 'Tag name in Arabic', example: 'موسيقى' })
  nameAr?: string;

  @ApiProperty({
    description: 'Creation date',
    example: '2023-06-20T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-06-20T10:00:00Z',
  })
  updatedAt: Date;
}

export class TagListResponseDto {
  @ApiProperty({ type: [TagResponseDto] })
  data: TagResponseDto[];

  @ApiProperty({ description: 'Total count of tags', example: 42 })
  total: number;
}
