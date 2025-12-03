import { Controller, Post, Body, Req, Get, Patch, Param, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  // Crear (Solo emprendedores - Protegido)
  @Post()
  @UseGuards(AuthenticatedGuard)
  create(@Body() body: any, @Req() req) {
    return this.campaignsService.create(req.session.user.id, body);
  }

  // Listar Mis Campañas (Solo emprendedores - Protegido)
  @Get('my-campaigns')
  @UseGuards(AuthenticatedGuard)
  findMyCampaigns(@Req() req) {
    return this.campaignsService.findAllByEntrepreneur(req.session.user.id);
  }

  // Listar TODAS las activas (PÚBLICO)
  @Get('active')
  findActive() {
    return this.campaignsService.findAllActive();
  }

  // Editar Campaña (Emprendedor dueño o Admin - Protegido)
  @Patch(':id')
  @UseGuards(AuthenticatedGuard)
  update(@Param('id') id: string, @Body() body: any, @Req() req) {
    const user = req.session.user;
    return this.campaignsService.update(Number(id), user.id, user.role, body);
  }
}