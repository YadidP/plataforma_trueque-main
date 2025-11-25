import { Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg.service'; // Import PgService

@Injectable()
export class WalletService {
  constructor(
    private readonly pgService: PgService, // Inject PgService
  ) {}

  async getBalance(userId: number) {
    const query = `
      SELECT id, user_id as "userId", balance, last_updated as "lastUpdated"
      FROM wallets
      WHERE user_id = $1;
    `;
    const result = await this.pgService.query(query, [userId]);
    
    if (result.rows.length === 0) {
      throw new NotFoundException('Billetera no encontrada para este usuario.');
    }
    return result.rows[0];
  }

  async getMovements(userId: number) {
    const query = `
      SELECT
        id,
        log_date as "logDate",
        operation_type as "operationType",
        delta,
        balance_after as "balanceAfter"
      FROM credits_log
      WHERE user_id = $1
      ORDER BY log_date DESC;
    `;
    const result = await this.pgService.query(query, [userId]);
    
    return result.rows.map(log => ({
        id: log.id,
        date: log.logDate.toISOString(),
        description: log.operationType,
        delta: Number(log.delta),
        balanceAfter: Number(log.balanceAfter)
    }));
  }
}
