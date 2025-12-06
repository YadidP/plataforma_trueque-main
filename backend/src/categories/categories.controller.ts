import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common'; // Añadir Post, Body, UseGuards
import { CategoriesService } from './categories.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard'; // Importar Guard

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAllWithSubcategories();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  // --- NUEVO ENDPOINT ---
  @Post()
  @UseGuards(AuthenticatedGuard)
  create(@Body() body: { name: string }) {
    return this.categoriesService.create(body.name);
  }
}
