import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { PgService } from 'src/database/pg.service'; // Import PgService

@Injectable()
export class ExchangesService {
  constructor(
    private readonly pgService: PgService, // Inject PgService
  ) { }

  async create(buyerId: number, createExchangeDto: CreateExchangeDto) {
    try {
      // El trigger se encarga de toda la lógica atómica.
      // Aquí solo llamamos al procedimiento que inserta en la tabla `exchanges`.
      await this.pgService.query(
        'CALL sp_registrar_intercambio($1, $2, $3)',
        [buyerId, createExchangeDto.listingId, createExchangeDto.quantity],
      );

      // NUEVO: Obtener el último intercambio creado con su impacto
      const lastExchangeResult = await this.pgService.query(`
        SELECT 
          e.id,
          e.credits_total,
          COALESCE(
            json_agg(
              json_build_object(
                'code', ei.metric_code,
                'name', ei.metric_name,
                'unit', ei.metric_unit,
                'value', ei.impact_value
              )
            ) FILTER (WHERE ei.id IS NOT NULL),
            '[]'
          ) as impacts
        FROM exchanges e
        LEFT JOIN exchange_impacts ei ON e.id = ei.exchange_id
        WHERE e.buyer_id = $1
          AND e.listing_id = $2
        GROUP BY e.id, e.credits_total
        ORDER BY e.exchange_date DESC
        LIMIT 1
      `, [buyerId, createExchangeDto.listingId]);

      return {
        message: 'Intercambio registrado con éxito.',
        exchange: lastExchangeResult.rows[0]
      };
    } catch (error: any) {
      console.error("Error al ejecutar sp_registrar_intercambio:", error);
      // Capturar errores específicos de la base de datos (RAISE EXCEPTION)
      if (error.message.includes('Saldo insuficiente')) {
        throw new ConflictException('Saldo insuficiente para completar esta operación.');
      }
      if (error.message.includes('no está activa')) {
        throw new ConflictException('La publicación no está disponible para intercambio.');
      }
      if (error.message.includes('no puede comprar su propia publicación')) {
        throw new ConflictException('No puedes intercambiar tu propia publicación.');
      }
      throw new InternalServerErrorException('Ocurrió un error al procesar el intercambio.');
    }
  }

  async findForUser(userId: number) {
    const query = `
      SELECT
        e.id,
        e.listing_id as "listingId",
        l.title as "listingTitle",
        e.buyer_id as "buyerId",
        ub.name as "buyerName",
        e.seller_id as "sellerId",
        us.name as "sellerName",
        e.quantity,
        e.credits_total as "creditsTotal",
        e.exchange_date as "exchangeDate",
        COALESCE(
            json_agg(
                json_build_object(
                    'code', ei.metric_code,
                    'name', ei.metric_name,
                    'unit', ei.metric_unit,
                    'value', ei.impact_value
                )
            ) FILTER (WHERE ei.id IS NOT NULL),
            '[]'
        ) as impacts
      FROM exchanges e
      JOIN listings l ON e.listing_id = l.id
      JOIN users ub ON e.buyer_id = ub.id
      JOIN users us ON e.seller_id = us.id
      LEFT JOIN exchange_impacts ei ON e.id = ei.exchange_id
      WHERE e.buyer_id = $1 OR e.seller_id = $1
      GROUP BY e.id, l.title, ub.name, us.name
      ORDER BY e.exchange_date DESC;
    `;
    const result = await this.pgService.query(query, [userId]);

    // Mapeamos el resultado para que coincida con la interfaz `Exchange` del frontend
    return result.rows.map(ex => ({
      id: ex.id,
      listingId: ex.listingId,
      listingTitle: ex.listingTitle,
      buyerId: ex.buyerId,
      buyerName: ex.buyerName,
      sellerId: ex.sellerId,
      sellerName: ex.sellerName,
      quantity: ex.quantity,
      totalCredits: Number(ex.creditsTotal),
      date: ex.exchangeDate.toISOString(),
      impacts: ex.impacts.map((impact: any) => ({ 
        code: impact.code,
        name: impact.name,
        value: Number(impact.value),
        unit: impact.unit,
      })),
    }));
  }
}
