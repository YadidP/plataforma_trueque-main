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
  unitCredits: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  unitLabel: string;
  
  @ApiProperty({ type: 'string', format: 'binary', required: true })
  imageFile: any;
}
