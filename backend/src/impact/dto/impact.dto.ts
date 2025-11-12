import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImpactDto {
  @ApiProperty({ example: 1, description: 'ID of the material' })
  @IsNumber()
  @IsNotEmpty()
  material_id: number;

  @ApiProperty({ example: 100, description: 'Quantity of the material' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: 'kg', description: 'Unit of the quantity (e.g., kg, units, liters)' })
  @IsString()
  @IsNotEmpty()
  quantity_unit: string;
}
