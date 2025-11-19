// backend/src/reports/reports.controller.ts
import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums';
import { UserReportDto, MonetizationReportDto, ImpactReportDto, ClaimsReportDto, DateRangeDto } from './dto/report-response.dto';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Get('my-impact')
  @ApiOperation({ summary: 'Get personal impact metrics for the logged-in user' })
  getMyImpact(@Req() req) {
    return this.reportsService.getUserImpactMetrics(req.user.id);
  }

  // --- ENDPOINTS PARA EL PANEL DE ADMINISTRACIÓN ---
  @Get('admin/users')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user activity reports for admin panel' })
  @ApiResponse({ status: 200, type: UserReportDto })
  getUsersReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getUsersReport(dateRange);
  }

  @Get('admin/monetization')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get monetization reports for admin panel' })
  @ApiResponse({ status: 200, type: MonetizationReportDto })
  getMonetizationReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getMonetizationReport(dateRange);
  }

  @Get('admin/impact')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get environmental impact reports for admin panel' })
  @ApiResponse({ status: 200, type: ImpactReportDto })
  getImpactReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getImpactReport(dateRange);
  }

  @Get('admin/claims')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get claims and custody reports for admin panel' })
  @ApiResponse({ status: 200, type: ClaimsReportDto })
  getClaimsReport(@Query() dateRange: DateRangeDto) {
    return this.reportsService.getClaimsReport(dateRange);
  }

  @Get('admin/advanced')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get advanced trends and ranking' })
  getAdvancedReport() {
    return this.reportsService.getAdvancedMetrics();
  }
}