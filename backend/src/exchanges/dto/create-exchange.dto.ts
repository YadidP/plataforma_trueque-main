import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateExchangeDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  listingId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  quantity: number;
}
