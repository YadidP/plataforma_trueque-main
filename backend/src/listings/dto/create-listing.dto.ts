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
  subcategoryId: string;

  @ApiProperty()
  @IsNumberString()
  @IsOptional()
  materialId?: string;

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  unitCredits: string;

  @ApiProperty()
  @IsNumberString()
  @IsOptional()
  quantity?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  quantityRange?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  unitLabel?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: true, isArray: true })
  imageFiles: any[];
}
