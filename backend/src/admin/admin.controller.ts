import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UserRole } from 'src/common/enums';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // Aquí irían los endpoints para auditoría, gestión de usuarios, etc.

  @Get('admin-only')
  @ApiOperation({ summary: 'Test admin access' })
  getAdminData() {
    return "Acceso permitido solo a admin";
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
