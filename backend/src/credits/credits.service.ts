import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { PgService } from 'src/database/pg.service';
import { CreditPackage } from './dto/credit-package.dto';

@Injectable()
export class CreditsService {
  // En un sistema real, esto vendría de una tabla de configuración en la DB.
  private readonly packages: CreditPackage[] = [
    { id: 1, credits: 50, priceBs: 15.00 },
    { id: 2, credits: 100, priceBs: 25.00 },
    { id: 3, credits: 200, priceBs: 50.00 },
  ];

  constructor(private pgService: PgService) { }

  getCreditPackages(): CreditPackage[] {
    return this.packages;
  }

  // Compra de créditos (Recarga de saldo)
  async purchase(userId: number, purchaseCreditsDto: PurchaseCreditsDto) {
    const pkg = this.packages.find(p => p.id === purchaseCreditsDto.creditsPackageId);

    if (!pkg) {
      throw new BadRequestException('El paquete de créditos seleccionado no es válido.');
    }

    try {
      // Llamada al procedimiento almacenado
      await this.pgService.query(
        'CALL sp_comprar_creditos($1, $2, $3, $4)',
        [userId, pkg.credits, pkg.priceBs, purchaseCreditsDto.paymentRef],
      );
      return { message: 'Compra realizada con éxito.' };
    } catch (error: any) {
      console.error("Error al ejecutar sp_comprar_creditos:", error);
      throw new InternalServerErrorException('Ocurrió un error al procesar la compra.');
    }
  }

  // --- SECCIÓN DE SUSCRIPCIONES (PLANES PREMIUM) ---

  async getSubscriptionPlans() {
    const res = await this.pgService.query('SELECT * FROM subscriptions ORDER BY price_bs ASC');
    return res.rows;
  }

  async getActiveSubscription(userId: number) {
    const query = `
      SELECT s.id, s.name, s.price_bs, s.description, us.end_date
      FROM user_subscriptions us
      JOIN subscriptions s ON us.subscription_id = s.id
      WHERE us.user_id = $1 AND us.is_active = true AND us.end_date > NOW()
      LIMIT 1;
    `;
    const res = await this.pgService.query(query, [userId]);
    return res.rows[0] || null;
  }

  async buySubscription(userId: number, planId: number) {
    // 1. Obtener precio del plan
    const planRes = await this.pgService.query('SELECT * FROM subscriptions WHERE id = $1', [planId]);
    const plan = planRes.rows[0];
    if (!plan) throw new BadRequestException('Plan no válido');

    // 2. Verificar si ya tiene ESTE plan activo para no cobrar doble
    const current = await this.getActiveSubscription(userId);
    if (current && current.id === planId) {
      throw new BadRequestException('Ya tienes este plan activo.');
    }

    // 3. Transacción
    await this.pgService.query('BEGIN');
    try {
      // A) Desactivar plan anterior (si existe)
      await this.pgService.query('UPDATE user_subscriptions SET is_active = false WHERE user_id = $1', [userId]);

      // B) Registrar el "Pago" en Bs (Simulado).
      // IMPORTANTE: No descontamos de la billetera de créditos (wallets),
      // sino que registramos un ingreso monetario directo en credit_purchases con 0 créditos otorgados.
      await this.pgService.query(
        "INSERT INTO credit_purchases (user_id, credits, amount_bs, status, payment_ref) VALUES ($1, 0, $2, 'pagado', 'SUSCRIPCION')",
        [userId, plan.price_bs]
      );

      // C) Activar nueva suscripción
      await this.pgService.query(`
            INSERT INTO user_subscriptions (user_id, subscription_id, start_date, end_date, is_active)
            VALUES ($1, $2, NOW(), NOW() + ($3 || ' days')::interval, true)
        `, [userId, planId, plan.duration_days]);

      await this.pgService.query('COMMIT');
      return { message: `¡Te has suscrito al ${plan.name} exitosamente!` };
    } catch (e) {
      await this.pgService.query('ROLLBACK');
      console.error(e);
      throw new InternalServerErrorException('Error al procesar la suscripción');
    }
  }
}