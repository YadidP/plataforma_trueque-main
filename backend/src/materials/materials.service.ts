import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service'; // Import PgService

@Injectable()
export class MaterialsService {
  constructor(
    private readonly pgService: PgService, // Inject PgService
  ) {}

  async findAll() {
    const query = `
      SELECT id, name
      FROM materials
      ORDER BY name ASC;
    `;
    const result = await this.pgService.query(query);
    return result.rows;
  }

  // --- NUEVO MÉTODO ---
  async create(name: string) {
    const query = 'INSERT INTO materials (name) VALUES ($1) RETURNING *';
    try {
      const res = await this.pgService.query(query, [name]);
      return res.rows[0];
    } catch (e) {
      throw new Error('Error creando material');
    }
  }
}
