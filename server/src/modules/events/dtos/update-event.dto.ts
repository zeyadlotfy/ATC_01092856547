import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateEventDto {
  @ApiProperty({ description: 'Title of the event', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({ description: 'Description of the event', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Arabic title of the event', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  titleAr?: string;

  @ApiProperty({
    description: 'Arabic description of the event',
    required: false,
  })
  @IsOptional()
  @IsString()
  descriptionAr?: string;

  @ApiProperty({
    description: 'Start date and time of the event',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'End date and time of the event',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Price of the event', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiProperty({ description: 'Currency for the price', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Main image URL of the event', required: false })
  @IsOptional()
  @IsString()
  mainImage?: string;

  @ApiProperty({
    description: 'Additional image URLs',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  additionalImages?: string[];

  @ApiProperty({ description: 'Maximum number of attendees', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxAttendees?: number;

  @ApiProperty({
    description: 'Whether the event is published',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({
    description: 'Whether the event is highlighted',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isHighlighted?: boolean;

  @ApiProperty({ description: 'Category ID of the event', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: 'Venue ID of the event', required: false })
  @IsOptional()
  @IsString()
  venueId?: string;

  @ApiProperty({
    description: 'Tag IDs for the event',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
