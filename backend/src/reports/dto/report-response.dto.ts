import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

// DTO para el query de fechas
export class DateRangeDto {
  @ApiProperty({ required: false, description: 'Fecha de inicio (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  startDate: string;

  @ApiProperty({ required: false, description: 'Fecha de fin (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  endDate: string;
}

// DTOs para las respuestas de los reportes
export class UserReportDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  newUsersInPeriod: number;

  @ApiProperty()
  activeUsersInPeriod: number;

  @ApiProperty()
  inactiveUsers: number;
}

export class MonetizationReportDto {
  @ApiProperty()
  revenueInPeriod: number;

  @ApiProperty()
  exchangesInPeriod: number;

  @ApiProperty()
  creditsPurchasedInPeriod: number;

  @ApiProperty()
  creditsExchangedInPeriod: number;
}

export class ImpactReportDto {
  @ApiProperty({ type: () => [ImpactByCategoryDto] })
  impactByCategory: ImpactByCategoryDto[];
}

export class ImpactByCategoryDto {
  @ApiProperty()
  categoryName: string;

  @ApiProperty()
  itemsExchanged: number;
}

export class ClaimsReportDto {
  @ApiProperty({ type: () => [ClaimsByStatusDto] })
  claimsByStatus: ClaimsByStatusDto[];
}

export class ClaimsByStatusDto {
  @ApiProperty()
  status: string;

  @ApiProperty()
  count: number;
}