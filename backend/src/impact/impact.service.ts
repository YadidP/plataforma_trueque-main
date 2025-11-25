import { Injectable } from '@nestjs/common';
import { ImpactDto } from './dto/impact.dto';
import { PgService } from 'src/database/pg.service'; // Import PgService

@Injectable()
export class ImpactService {
  constructor(
    private readonly pgService: PgService, // Inject PgService
  ) { }

  async calculateImpactPreview(impactDto: ImpactDto): Promise<any[]> {
    const { material_id, quantity, quantity_unit } = impactDto;

    const query = `
      SELECT
        ie.base_quantity,
        ie.impact_value,
        im.code,
        im.name,
        im.unit
      FROM impact_equivalences ie
      JOIN impact_metrics im ON ie.metric_id = im.id
      WHERE ie.material_id = $1 AND ie.base_unit = $2;
    `;
    const result = await this.pgService.query(query, [material_id, quantity_unit]);
    const equivalences = result.rows;

    if (!equivalences || equivalences.length === 0) {
      return [];
    }

    return equivalences.map(eq => ({
      code: eq.code,
      name: eq.name,
      unit: eq.unit,
      value: parseFloat(((quantity / parseFloat(eq.base_quantity.toString())) * parseFloat(eq.impact_value.toString())).toFixed(2)),
    })).sort((a, b) => {
      // Ordenar: CO2, WATER, ENERGY, WASTE, TREES
      const order: Record<string, number> = { 'CO2': 0, 'WATER': 1, 'ENERGY': 2, 'WASTE': 3, 'TREES': 4 };
      return (order[a.code] ?? 99) - (order[b.code] ?? 99);
    });
  }
}
