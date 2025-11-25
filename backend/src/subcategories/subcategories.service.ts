import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg.service'; // Import PgService

@Injectable()
export class SubcategoriesService {
  constructor(
    private readonly pgService: PgService, // Inject PgService
  ) {}

  async findByCategoryId(categoryId: number): Promise<any[]> { // Change return type
    const query = `
      SELECT id, category_id as "categoryId", name
      FROM subcategories
      WHERE category_id = $1;
    `;
    const result = await this.pgService.query(query, [categoryId]);
    return result.rows;
  }

  async findMaterialsBySubcategoryId(id: number): Promise<any[]> { // Change return type
    const query = `
      SELECT
        m.id,
        m.name
      FROM materials m
      JOIN subcategory_materials sm ON m.id = sm.material_id
      WHERE sm.subcategory_id = $1;
    `;
    const result = await this.pgService.query(query, [id]);
    
    if (result.rows.length === 0) {
      // Check if subcategory exists at all before throwing NotFoundException
      const subcategoryExists = await this.pgService.query('SELECT 1 FROM subcategories WHERE id = $1;', [id]);
      if (subcategoryExists.rows.length === 0) {
        throw new NotFoundException(`Subcategoría con ID ${id} no encontrada.`);
      }
    }
    return result.rows;
  }
}
