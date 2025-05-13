import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class CreateBookingDto {
  @ApiProperty({ description: 'Event ID', example: '60d21b4667d0d8992e610c85' })
  @IsNotEmpty()
  @IsMongoId()
  eventId: string;

  @ApiProperty({ description: 'Number of tickets', example: 2, default: 1 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity: number = 1;
}

export class UpdateBookingDto {
  @ApiPropertyOptional({ enum: BookingStatus, description: 'Booking status' })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiPropertyOptional({ description: 'Number of tickets', example: 2 })
  @IsInt()
  @IsPositive()
  @IsOptional()
  quantity?: number;
}

export class BookingFeedbackDto {
  @ApiProperty({ description: 'Feedback comment', example: 'Great event!' })
  @IsString()
  @IsNotEmpty()
  feedback: string;

  @ApiProperty({ description: 'Rating (1-5)', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;
}

export class BookingResponseDto {
  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  id: string;

  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  userId: string;

  @ApiProperty({ example: '60d21b4667d0d8992e610c85' })
  eventId: string;

  @ApiProperty({ enum: BookingStatus, example: 'CONFIRMED' })
  status: BookingStatus;

  @ApiProperty({ example: 2 })
  quantity: number;

  @ApiProperty({ example: 150.0 })
  totalPrice: number;

  @ApiProperty({ example: '2023-04-25T12:00:00.000Z' })
  bookingDate: Date;

  @ApiPropertyOptional({ example: '2023-04-26T12:00:00.000Z' })
  cancellationDate?: Date;

  @ApiPropertyOptional({ example: 'Great event!' })
  feedback?: string;

  @ApiPropertyOptional({ example: 5 })
  rating?: number;

  @ApiProperty()
  event?: any;
}

export class BookingQueryParamsDto {
  @ApiPropertyOptional({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  @IsOptional()
  status?: BookingStatus;

  @ApiPropertyOptional({ example: '60d21b4667d0d8992e610c85' })
  @IsMongoId()
  @IsOptional()
  eventId?: string;
}
