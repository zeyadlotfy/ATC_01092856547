import { ApiProperty } from '@nestjs/swagger';

export class EventFilterDto {
  search?: string;
  categoryId?: string;
  venueId?: string;
  tagIds?: string[];
  startDate?: string;
  endDate?: string;
  isPublished?: boolean;
  isHighlighted?: boolean;
  page?: number;
  limit?: number;
}

export class EventResponseDto {
  @ApiProperty({ description: 'Event ID' })
  id: string;

  @ApiProperty({ description: 'Title of the event' })
  title: string;

  @ApiProperty({ description: 'Description of the event' })
  description: string;

  @ApiProperty({ description: 'Arabic title of the event', required: false })
  titleAr?: string;

  @ApiProperty({
    description: 'Arabic description of the event',
    required: false,
  })
  descriptionAr?: string;

  @ApiProperty({ description: 'Start date and time of the event' })
  startDate: Date;

  @ApiProperty({ description: 'End date and time of the event' })
  endDate: Date;

  @ApiProperty({ description: 'Price of the event' })
  price: number;

  @ApiProperty({ description: 'Currency for the price' })
  currency: string;

  @ApiProperty({ description: 'Main image URL of the event', required: false })
  mainImage?: string;

  @ApiProperty({ description: 'Additional image URLs', type: [String] })
  additionalImages: string[];

  @ApiProperty({ description: 'Maximum number of attendees', required: false })
  maxAttendees?: number;

  @ApiProperty({ description: 'Whether the event is published' })
  isPublished: boolean;

  @ApiProperty({ description: 'Whether the event is highlighted' })
  isHighlighted: boolean;

  @ApiProperty({ description: 'Category information' })
  category: {
    id: string;
    name: string;
    nameAr?: string;
  };

  @ApiProperty({ description: 'Venue information' })
  venue: {
    id: string;
    name: string;
    address: string;
    city: string;
    country: string;
    nameAr?: string;
  };

  @ApiProperty({ description: 'Tags information', type: [Object] })
  tags: Array<{
    id: string;
    name: string;
    nameAr?: string;
  }>;

  @ApiProperty({ description: 'Created at timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at timestamp' })
  updatedAt: Date;
}

export class EventsListResponseDto {
  @ApiProperty({ description: 'List of events', type: [EventResponseDto] })
  events: EventResponseDto[];

  @ApiProperty({ description: 'Total number of events' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of events per page' })
  limit: number;
}
