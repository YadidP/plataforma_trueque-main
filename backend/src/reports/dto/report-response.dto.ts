// backend/src/reports/dto/report-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class UserReportDto {
  @ApiProperty()
  totalUsers: number;
  
  @ApiProperty()
  activeUsers: { role: string; count: number }[];

  @ApiProperty()
  top10UsersByExchanges: any[];
  
  @ApiProperty()
  churnUsersCount: number;
}

export class MonetizationReportDto {
  @ApiProperty()
  totalRevenue: number;

  @ApiProperty()
  revenueLast30Days: number;

  @ApiProperty()
  creditSource: { source: string; amount: number }[];

  @ApiProperty()
  activePremiumUsers: number;
}

export class ImpactReportDto {
    @ApiProperty()
    totalItemsExchanged: number;

    @ApiProperty()
    exchangesByCategory: { categoryName: string; totalExchanges: number }[];
    
    @ApiProperty()
    listingToExchangeRatioByCategory: { categoryName: string; ratio: number }[];
}