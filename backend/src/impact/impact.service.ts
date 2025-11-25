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
  ) { }

  async calculateImpactPreview(impactDto: ImpactDto): Promise<any[]> {
    const { material_id, quantity, quantity_unit } = impactDto;

    const equivalences = await this.impactEquivalenceRepository.find({
      where: { materialId: material_id, baseUnit: quantity_unit },
      relations: ['metric'],
    });

    if (!equivalences || equivalences.length === 0) {
      return [];
    }

    return equivalences.map(eq => ({
      code: eq.metric.code,
      name: eq.metric.name,
      unit: eq.metric.unit,
      value: parseFloat(((quantity / parseFloat(eq.baseQuantity.toString())) * parseFloat(eq.impactValue.toString())).toFixed(2)),
    })).sort((a, b) => {
      // Ordenar: CO2, WATER, ENERGY, WASTE, TREES
      const order: Record<string, number> = { 'CO2': 0, 'WATER': 1, 'ENERGY': 2, 'WASTE': 3, 'TREES': 4 };
      return (order[a.code] ?? 99) - (order[b.code] ?? 99);
    });
  }
}
