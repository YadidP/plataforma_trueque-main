import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material, ImpactMetric, ImpactEquivalence } from '../entities';
import { ImpactDto } from './dto/impact.dto';

@Injectable()
export class ImpactService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
    @InjectRepository(ImpactMetric)
    private impactMetricRepository: Repository<ImpactMetric>,
    @InjectRepository(ImpactEquivalence)
    private impactEquivalenceRepository: Repository<ImpactEquivalence>,
  ) {}

  async calculateImpactPreview(impactDto: ImpactDto): Promise<any[]> {
    const { material_id, quantity, quantity_unit } = impactDto;

    const equivalences = await this.impactEquivalenceRepository.find({
      where: { material: { id: material_id }, baseUnit: quantity_unit },
      relations: ['metric'],
    });

    if (!equivalences || equivalences.length === 0) {
      return [];
    }

    return equivalences.map(eq => ({
      metric: eq.metric.name,
      unit: eq.metric.unit,
      value: (quantity / eq.baseQuantity) * eq.impactValue,
    }));
  }
}
