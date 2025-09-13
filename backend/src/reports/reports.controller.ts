import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  
  @Get('my-impact')
  getMyImpact(@Req() req) {
    return this.reportsService.getUserImpactMetrics(req.user.id);
  }
}
