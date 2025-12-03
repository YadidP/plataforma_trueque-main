import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PgService } from '../database/pg.service';

@Injectable()
export class CampaignsService {
  constructor(private pg: PgService) {}

  // ... (método create existente se mantiene igual) ...
  async create(userId: number, data: any) {
    // Validar rol emprendedor
    const user = await this.pg.query('SELECT role FROM users WHERE id=$1', [userId]);
    if (user.rows[0].role !== 'emprendedor') throw new BadRequestException('Solo emprendedores pueden crear campañas');

    const client = await this.pg['pool'].connect();
    try {
        await client.query('BEGIN');
        
        const campRes = await client.query(`
            INSERT INTO campaigns (entrepreneur_id, name, type, start_date, end_date, config)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        `, [userId, data.name, data.type, data.startDate, data.endDate, data.config]);
        
        const campaignId = campRes.rows[0].id;

        // Insertar items
        if (data.type === 'discount' && data.itemIds) {
            for (const lid of data.itemIds) {
                await client.query('INSERT INTO campaign_items (campaign_id, listing_id, role) VALUES ($1, $2, $3)',
                    [campaignId, lid, 'target']);
            }
        } else if (data.type === 'gift' && data.rewardId) {
            await client.query('INSERT INTO campaign_items (campaign_id, listing_id, role) VALUES ($1, $2, $3)',
                [campaignId, data.rewardId, 'reward']);
        }

        await client.query('COMMIT');
        return { success: true, id: campaignId };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
  }

  // ... (método findAllByEntrepreneur existente) ...
  async findAllByEntrepreneur(userId: number) {
      const res = await this.pg.query('SELECT * FROM campaigns WHERE entrepreneur_id = $1 ORDER BY created_at DESC', [userId]);
      return res.rows;
  }

  // --- NUEVOS MÉTODOS ---

  async findAllActive() {
    // Traemos la campaña, el nombre del emprendedor y un array con los títulos de los productos involucrados
    const query = `
        SELECT 
            c.id, c.name, c.type, c.start_date as "startDate", c.end_date as "endDate", 
            c.status, c.config, c.entrepreneur_id as "entrepreneurId",
            u.name as "entrepreneurName",
            COALESCE(
                json_agg(l.title) FILTER (WHERE l.id IS NOT NULL), 
                '[]'
            ) as items
        FROM campaigns c
        JOIN users u ON c.entrepreneur_id = u.id
        LEFT JOIN campaign_items ci ON c.id = ci.campaign_id
        LEFT JOIN listings l ON ci.listing_id = l.id
        WHERE c.status != 'expired' AND c.end_date > NOW()
        GROUP BY c.id, u.name
        ORDER BY c.status ASC, c.created_at DESC;
    `;
    const res = await this.pg.query(query);
    return res.rows;
  }

  async update(campaignId: number, userId: number, userRole: string, data: any) {
    // 1. Verificar propiedad
    const campRes = await this.pg.query('SELECT entrepreneur_id FROM campaigns WHERE id = $1', [campaignId]);
    if (campRes.rows.length === 0) throw new NotFoundException('Campaña no encontrada');
    
    const campaign = campRes.rows[0];

    // Solo el dueño o un admin pueden editar
    if (campaign.entrepreneur_id !== userId && userRole !== 'admin') {
        throw new ForbiddenException('No tienes permiso para editar esta campaña');
    }

    // 2. Construir update dinámico (status, fechas, nombre)
    const fields = [];
    const values = [];
    let idx = 1;

    if (data.status) { fields.push(`status = $${idx++}`); values.push(data.status); }
    if (data.name) { fields.push(`name = $${idx++}`); values.push(data.name); }
    if (data.endDate) { fields.push(`end_date = $${idx++}`); values.push(data.endDate); }

    if (fields.length === 0) return { message: 'Nada que actualizar' };

    values.push(campaignId);
    const query = `UPDATE campaigns SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    
    await this.pg.query(query, values);
    return { success: true, message: 'Campaña actualizada' };
  }
}