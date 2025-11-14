import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, IsOptional } from 'class-validator';

export class CreateListingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  subcategoryId: string; // New field

  @ApiProperty()
  @IsNumberString()
  @IsOptional()
  materialId?: string; // New field - OPTIONAL

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  unitCredits: string;

  @ApiProperty()
  @IsNumberString()
  @IsOptional()
  quantity?: string; // New field - OPTIONAL

  @ApiProperty()
  @IsString()
  @IsOptional()
  quantityRange?: string; // e.g., "1-5", "5-10"

  @ApiProperty()
  @IsString()
  @IsOptional()
  unitLabel?: string; // OPTIONAL

  @ApiProperty({ type: 'string', format: 'binary', required: true })
  imageFile: any;
}
