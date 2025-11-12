import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString } from 'class-validator';

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
  @IsNotEmpty()
  materialId: string; // New field

  @ApiProperty()
  @IsNumberString()
  @IsNotEmpty()
  unitCredits: string;

  @ApiProperty()
  @IsNumberString() // Quantity can be a number string
  @IsNotEmpty()
  quantity: string; // New field

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitLabel: string;
  
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  imageFile: any;
}
