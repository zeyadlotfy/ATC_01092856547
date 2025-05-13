import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateVenueDto {
  @ApiProperty({ description: 'Name of the venue' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Arabic name of the venue' })
  @IsString()
  @IsOptional()
  nameAr?: string;

  @ApiProperty({ description: 'Address of the venue' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'City where the venue is located' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Country where the venue is located' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ description: 'Maximum capacity of the venue' })
  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;
}
