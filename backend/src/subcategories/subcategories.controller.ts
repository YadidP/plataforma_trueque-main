import { Controller, Get, Param } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('subcategories')
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get(':id/materials')
  findMaterials(@Param('id') id: string) {
    return this.subcategoriesService.findMaterialsBySubcategoryId(+id);
  }
}
