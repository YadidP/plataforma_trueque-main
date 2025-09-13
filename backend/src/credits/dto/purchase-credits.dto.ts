import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class PurchaseCreditsDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  creditsPackageId: number;

  @ApiProperty({ example: 'REF-12345' })
  @IsString()
  @IsNotEmpty()
  paymentRef: string;
}
