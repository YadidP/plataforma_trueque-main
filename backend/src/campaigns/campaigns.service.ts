import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

@Injectable()
export class CampaignsService {
  constructor(private pgService: PgService) {}

  async create(userId: number, dto: CreateCampaignDto) {
    const query = `
      INSERT INTO campaigns 
      (entrepreneur_id, title, description, type, target_metric_code, target_value, reward_credits, end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `;
    const values = [
      userId, dto.title, dto.description, dto.type, 
      dto.targetMetricCode || null, dto.targetValue || null, 
      dto.rewardCredits, dto.endDate || null
    ];
    return (await this.pgService.query(query, values)).rows[0];
  }

  async findAll(role: string, userId: number) {
    // Si es emprendedor, ve las suyas. Si es user/admin, ve las activas.
    if (role === 'emprendedor') {
      return (await this.pgService.query('SELECT * FROM campaigns WHERE entrepreneur_id = $1 ORDER BY created_at DESC', [userId])).rows;
    }
    // Usuarios ven campañas activas y si ya participaron
    const query = `
        SELECT c.*, u.name as entrepreneur_name,
        (SELECT COUNT(*) FROM campaign_participants cp WHERE cp.campaign_id = c.id AND cp.user_id = $1) > 0 as participated
        FROM campaigns c
        JOIN users u ON c.entrepreneur_id = u.id
        WHERE c.is_active = true
        ORDER BY c.created_at DESC
    `;
    return (await this.pgService.query(query, [userId])).rows;
  }

  // ACCIÓN 1: Emprendedor paga manualmente a un usuario (por email)
  async rewardUserManually(entrepreneurId: number, email: string, campaignId: number) {
    const client = await this.pgService['pool'].connect();
    try {
      await client.query('BEGIN');

      // 1. Validar campaña y propiedad
      const campRes = await client.query('SELECT * FROM campaigns WHERE id = $1 AND entrepreneur_id = $2', [campaignId, entrepreneurId]);
      const campaign = campRes.rows[0];
      if (!campaign) throw new BadRequestException('Campaña no válida o sin permisos');
      if (campaign.type !== 'manual') throw new BadRequestException('Esta campaña no es de pago manual');

      // 2. Buscar usuario beneficiario
      const userRes = await client.query('SELECT id FROM users WHERE email = $1', [email]);
      const targetUser = userRes.rows[0];
      if (!targetUser) throw new NotFoundException('Usuario no encontrado con ese email');
      if (targetUser.id === entrepreneurId) throw new BadRequestException('No puedes pagarte a ti mismo');

      // 3. Verificar fondos del emprendedor
      const walletRes = await client.query('SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE', [entrepreneurId]);
      if (walletRes.rows[0].balance < campaign.reward_credits) throw new BadRequestException('Saldo insuficiente en tu billetera');

      // 4. TRANSFERENCIA ATÓMICA
      const amount = campaign.reward_credits;
      
      // Restar al emprendedor
      await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [amount, entrepreneurId]);
      await client.query("INSERT INTO credits_log (user_id, operation_type, delta, balance_after, related_id) VALUES ($1, 'pago_campaña_salida', $2, (SELECT balance FROM wallets WHERE user_id=$1), $3)", [entrepreneurId, -amount, campaignId]);

      // Sumar al usuario
      await client.query('INSERT INTO wallets (user_id, balance) VALUES ($1, 0) ON CONFLICT (user_id) DO NOTHING', [targetUser.id]); // Ensure wallet
      await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2', [amount, targetUser.id]);
      await client.query("INSERT INTO credits_log (user_id, operation_type, delta, balance_after, related_id) VALUES ($1, 'recompensa_campaña', $2, (SELECT balance FROM wallets WHERE user_id=$1), $3)", [targetUser.id, amount, campaignId]);

      // 5. Registrar participación
      await client.query('INSERT INTO campaign_participants (campaign_id, user_id, rewarded_credits) VALUES ($1, $2, $3)', [campaignId, targetUser.id, amount]);

      await client.query('COMMIT');
      return { message: 'Recompensa enviada exitosamente' };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  // ACCIÓN 2: Usuario reclama recompensa automática (por métricas)
  async claimAutomaticReward(userId: number, campaignId: number) {
    const client = await this.pgService['pool'].connect();
    try {
      await client.query('BEGIN');

      // 1. Obtener campaña
      const campRes = await client.query('SELECT * FROM campaigns WHERE id = $1', [campaignId]);
      const campaign = campRes.rows[0];
      if (!campaign || !campaign.is_active) throw new BadRequestException('Campaña no activa');
      if (campaign.type !== 'metrica') throw new BadRequestException('Esta campaña no es automática');

      // 2. Verificar si ya reclamó
      const partRes = await client.query('SELECT 1 FROM campaign_participants WHERE campaign_id = $1 AND user_id = $2', [campaignId, userId]);
      if (partRes.rowCount > 0) throw new BadRequestException('Ya has reclamado esta recompensa');

      // 3. Calcular métricas del usuario
      // Reutilizamos lógica de impacto, sumando todo su histórico
      const impactRes = await client.query(`
        SELECT COALESCE(SUM(ei.impact_value), 0) as total
        FROM exchange_impacts ei
        JOIN exchanges e ON ei.exchange_id = e.id
        WHERE (e.buyer_id = $1 OR e.seller_id = $1) AND ei.metric_code = $2
      `, [userId, campaign.target_metric_code]);
      
      const currentImpact = parseFloat(impactRes.rows[0].total);
      
      if (currentImpact < parseFloat(campaign.target_value)) {
        throw new BadRequestException(`No cumples la meta. Tienes ${currentImpact}, necesitas ${campaign.target_value}`);
      }

      // 4. Verificar fondos del emprendedor (dueño de la campaña)
      const entrepreneurId = campaign.entrepreneur_id;
      const walletRes = await client.query('SELECT balance FROM wallets WHERE user_id = $1 FOR UPDATE', [entrepreneurId]);
      if (walletRes.rows[0].balance < campaign.reward_credits) throw new BadRequestException('La campaña se ha quedado sin fondos momentáneamente');

      // 5. TRANSFERENCIA
      const amount = campaign.reward_credits;
      
      await client.query('UPDATE wallets SET balance = balance - $1 WHERE user_id = $2', [amount, entrepreneurId]);
      await client.query('UPDATE wallets SET balance = balance + $1 WHERE user_id = $2', [amount, userId]);
      
      // Logs y registro
      await client.query("INSERT INTO credits_log (user_id, operation_type, delta, balance_after) VALUES ($1, 'pago_campaña_auto', $2, (SELECT balance FROM wallets WHERE user_id=$1))", [entrepreneurId, -amount]);
      await client.query("INSERT INTO credits_log (user_id, operation_type, delta, balance_after) VALUES ($1, 'recompensa_metrica', $2, (SELECT balance FROM wallets WHERE user_id=$1))", [userId, amount]);
      
      await client.query('INSERT INTO campaign_participants (campaign_id, user_id, rewarded_credits) VALUES ($1, $2, $3)', [campaignId, userId, amount]);

      await client.query('COMMIT');
      return { message: `¡Felicidades! Has recibido ${amount} créditos por tu impacto.` };

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
