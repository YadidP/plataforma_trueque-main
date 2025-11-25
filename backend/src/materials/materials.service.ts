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
}
