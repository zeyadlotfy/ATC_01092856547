import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Title of the event' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @ApiProperty({ description: 'Description of the event' })
  @IsNotEmpty()
  @IsString()
  description: string;

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

  @ApiProperty({ description: 'Start date and time of the event' })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({ description: 'End date and time of the event' })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({ description: 'Price of the event' })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'Currency for the price', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Maximum number of attendees', required: false })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  maxAttendees?: number;

  @ApiProperty({
    description: 'Whether the event is published',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({
    description: 'Whether the event is highlighted',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isHighlighted?: boolean;

  @ApiProperty({ description: 'Category ID of the event' })
  @IsNotEmpty()
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Venue ID of the event' })
  @IsNotEmpty()
  @IsString()
  venueId: string;

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
