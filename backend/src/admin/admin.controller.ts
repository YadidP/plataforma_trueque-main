import { Controller, Get, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // Aquí irían los endpoints para auditoría, gestión de usuarios, etc.

  @Get('admin-only')
  @ApiOperation({ summary: 'Test admin access' })
  getAdminData() {
    return "Acceso permitido solo a admin (ahora público para simplificación)";
  }

  @Get('stats/publications')
  @ApiOperation({ summary: 'Get total publications count' })
  getPublicationsCount() {
    return this.adminService.getPublicationsCount();
  }

  @Get('stats/publications-vs-exchanges')
  @ApiOperation({ summary: 'Get publications vs exchanges comparison data' })
  getPublicationsVsExchanges(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getPublicationsVsExchanges(startDate, endDate);
  }
}
