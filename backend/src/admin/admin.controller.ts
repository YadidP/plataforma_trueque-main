import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
// Asumimos que tienes un guard de admin, si no, usa el AuthenticatedGuard y valida rol en servicio o guard
// Por ahora usaremos AuthenticatedGuard por simplicidad
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@ApiTags('admin')
@Controller('admin')
@UseGuards(AuthenticatedGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  @Get('kpi-summary')
  @ApiOperation({ summary: 'Obtener indicadores principales para el dashboard' })
  getKpiSummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // Fechas por defecto si no vienen
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];
    return this.adminService.getKpiSummary(start, end);
  }

  @Get('list/users')
  getUsersList() { return this.adminService.getUsersList(); }

  @Get('list/finance')
  getFinanceList() { return this.adminService.getFinanceList(); }

  @Get('list/listings')
  getListingsList() { return this.adminService.getListingsList(); }

  @Get('list/exchanges')
  getExchangesList() { return this.adminService.getExchangesList(); }

  @Get('charts/user-dynamics')
  getUserDynamics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('role') role: string, // admin, usuario, emprendedor, ALL
  ) {
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0];
    return this.adminService.getUserDynamics(start, end, role || 'ALL');
  }

  @Get('charts/economy')
  getEconomyData(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0];
    return this.adminService.getEconomyData(start, end);
  }
}
