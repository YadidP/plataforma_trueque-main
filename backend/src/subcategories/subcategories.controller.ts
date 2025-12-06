import { Controller, Get, Param, Post, Body, UseGuards } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@ApiTags('subcategories')
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  // ... métodos existentes ...
  @Get('by-category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.subcategoriesService.findByCategoryId(+categoryId);
  }

  @Get(':id/materials')
  findMaterials(@Param('id') id: string) {
    return this.subcategoriesService.findMaterialsBySubcategoryId(+id);
  }

  // --- NUEVO ENDPOINT ---
  @Post()
  @UseGuards(AuthenticatedGuard)
  create(@Body() body: { name: string; categoryId: number }) {
    return this.subcategoriesService.create(body.name, body.categoryId);
  }
}
