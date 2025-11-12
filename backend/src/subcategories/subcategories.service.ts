import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Subcategory } from 'src/entities/subcategory.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private subcategoriesRepository: Repository<Subcategory>,
  ) {}

  async findMaterialsBySubcategoryId(id: number) {
    const subcategory = await this.subcategoriesRepository.findOne({
      where: { id },
      relations: ['materials'],
    });
    if (!subcategory) {
      throw new NotFoundException(`Subcategoría con ID ${id} no encontrada.`);
    }
    return subcategory.materials;
  }
}
