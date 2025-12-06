import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg.service'; // Import PgService

@Injectable()
export class CategoriesService {
  constructor(
    private readonly pgService: PgService, // Inject PgService
  ) {}

  async findAllWithSubcategories() {
    const query = `
      SELECT
        c.id,
        c.name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', s.id,
              'categoryId', s.category_id,
              'name', s.name
            ) ORDER BY s.name ASC
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'
        ) AS subcategories
      FROM categories c
      LEFT JOIN subcategories s ON c.id = s.category_id
      GROUP BY c.id, c.name
      ORDER BY c.name ASC;
    `;
    const result = await this.pgService.query(query);
    return result.rows;
  }

  async findAll() {
    const query = `
      SELECT id, name
      FROM categories
      ORDER BY name ASC;
    `;
    const result = await this.pgService.query(query);
    return result.rows;
  }

  async findOne(id: number) {
    const query = `
      SELECT id, name
      FROM categories
      WHERE id = $1;
    `;
    const result = await this.pgService.query(query, [id]);
    const category = result.rows[0];
    if (!category) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada.`);
    }
    return category;
  }

  // --- NUEVO MÉTODO ---
  async create(name: string) {
    const query = 'INSERT INTO categories (name) VALUES ($1) RETURNING *';
    try {
      const res = await this.pgService.query(query, [name]);
      return res.rows[0];
    } catch (e) {
      throw new Error('Error creando categoría (posible duplicado)');
    }
  }
}
