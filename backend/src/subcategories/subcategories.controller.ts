import { Controller, Get, Param } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subcategories')
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get('by-category/:categoryId')
  findByCategory(@Param('categoryId') categoryId: string) {
    return this.subcategoriesService.findByCategoryId(+categoryId);
  }

  @Get(':id/materials')
  findMaterials(@Param('id') id: string) {
    return this.subcategoriesService.findMaterialsBySubcategoryId(+id);
  }
}
