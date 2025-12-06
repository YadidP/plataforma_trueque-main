import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  findAll() {
    return this.materialsService.findAll();
  }

  // --- NUEVO ENDPOINT ---
  @Post()
  @UseGuards(AuthenticatedGuard)
  create(@Body() body: { name: string }) {
    return this.materialsService.create(body.name);
  }
}
