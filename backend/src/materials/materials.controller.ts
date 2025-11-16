import { Controller, Get } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('materials')
@Controller('materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Get()
  findAll() {
    return this.materialsService.findAll();
  }
}
