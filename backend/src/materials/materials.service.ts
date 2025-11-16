import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from 'src/entities';

@Injectable()
export class MaterialsService {
  constructor(
    @InjectRepository(Material)
    private materialsRepository: Repository<Material>,
  ) {}

  async findAll() {
    return this.materialsRepository.find({
      order: { name: 'ASC' },
    });
  }
}
