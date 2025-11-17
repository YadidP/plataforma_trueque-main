import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums';
import { UserReportDto, MonetizationReportDto, ImpactReportDto } from './dto/report-response.dto';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard) // Proteger todas las rutas del controlador
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  // --- ENDPOINT PARA EL DASHBOARD DEL USUARIO ---
  @Get('my-impact')
  @ApiOperation({ summary: 'Get personal impact metrics for the logged-in user' })
  getMyImpact(@Req() req) {
    // No se necesita @Roles(UserRole.ADMIN), es para cualquier usuario logueado.
    return this.reportsService.getUserImpactMetrics(req.user.id);
  }

  // --- ENDPOINTS PARA EL PANEL DE ADMINISTRACIÓN ---
  @Get('admin/users')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user activity reports for admin panel' })
  @ApiResponse({ status: 200, type: UserReportDto })
  getUsersReport() {
    return this.reportsService.getUsersReport();
  }

  @Get('admin/monetization')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get monetization reports for admin panel' })
  @ApiResponse({ status: 200, type: MonetizationReportDto })
  getMonetizationReport() {
    return this.reportsService.getMonetizationReport();
  }

  @Get('admin/impact')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get environmental impact reports for admin panel' })
  @ApiResponse({ status: 200, type: ImpactReportDto })
  getImpactReport() {
    return this.reportsService.getImpactReport();
  }
}