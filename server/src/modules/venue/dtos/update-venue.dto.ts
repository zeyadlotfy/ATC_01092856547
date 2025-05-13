import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class UpdateVenueDto {
  @ApiPropertyOptional({ description: 'Name of the venue' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Arabic name of the venue' })
  @IsString()
  @IsOptional()
  nameAr?: string;

  @ApiPropertyOptional({ description: 'Address of the venue' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ description: 'City where the venue is located' })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({ description: 'Country where the venue is located' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ description: 'Maximum capacity of the venue' })
  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;
}
