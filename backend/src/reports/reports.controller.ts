// backend/src/reports/reports.controller.ts
import { Controller, Get, Req, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserReportDto, MonetizationReportDto, ImpactReportDto, ClaimsReportDto, DateRangeDto } from './dto/report-response.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('my-impact')
  @UseGuards(AuthenticatedGuard)
  @ApiOperation({ summary: 'Get personal impact metrics for the logged-in user' })
  getMyImpact(@Req() req) {
    const userId = req.session.user.id;
    return this.reportsService.getUserImpactMetrics(userId);
  }

  // --- ENDPOINTS PARA EL PANEL DE ADMINISTRACIÓN ---
  @Get('admin/users')
  @ApiOperation({ summary: 'Get user activity reports for admin panel' })
  @ApiResponse({ status: 200, type: UserReportDto })
  getUsersReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getUsersReport(dateRange);
  }

  @Get('admin/monetization')
  @ApiOperation({ summary: 'Get monetization reports for admin panel' })
  @ApiResponse({ status: 200, type: MonetizationReportDto })
  getMonetizationReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getMonetizationReport(dateRange);
  }

  @Get('admin/impact')
  @ApiOperation({ summary: 'Get environmental impact reports for admin panel' })
  @ApiResponse({ status: 200, type: ImpactReportDto })
  getImpactReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getImpactReport(dateRange);
  }

  @Get('admin/claims')
  @ApiOperation({ summary: 'Get claims and custody reports for admin panel' })
  @ApiResponse({ status: 200, type: ClaimsReportDto })
  getClaimsReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getClaimsReport(dateRange);
  }

  @Get('admin/advanced')
  @ApiOperation({ summary: 'Get advanced trends and ranking' })
  getAdvancedReport() {
    return this.reportsService.getAdvancedMetrics();
  }
}