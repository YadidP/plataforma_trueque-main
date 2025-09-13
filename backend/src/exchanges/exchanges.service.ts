import { Injectable, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { DataSource, Repository } from 'typeorm';
import { Exchange } from 'src/entities';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ExchangesService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Exchange)
    private exchangesRepository: Repository<Exchange>,
  ) {}

  async create(buyerId: number, createExchangeDto: CreateExchangeDto) {
    try {
      // El trigger se encarga de toda la lógica atómica.
      // Aquí solo llamamos al procedimiento que inserta en la tabla `exchanges`.
      await this.dataSource.query(
        'CALL sp_registrar_intercambio($1, $2, $3)',
        [buyerId, createExchangeDto.listingId, createExchangeDto.quantity],
      );
      return { message: 'Intercambio registrado con éxito.' };
    } catch (error) {
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
    const exchanges = await this.exchangesRepository.find({
        where: [
            { buyerId: userId },
            { sellerId: userId },
        ],
        relations: ['listing', 'buyer', 'seller'],
        order: { exchangeDate: 'DESC' },
    });

    // Mapeamos el resultado para que coincida con la interfaz `Exchange` del frontend
    return exchanges.map(ex => ({
        id: ex.id,
        listingId: ex.listingId,
        listingTitle: ex.listing.title,
        buyerId: ex.buyerId,
        buyerName: ex.buyer.name,
        sellerId: ex.sellerId,
        sellerName: ex.seller.name,
        quantity: ex.quantity,
        totalCredits: Number(ex.creditsTotal),
        date: ex.exchangeDate.toISOString(),
    }));
  }
}
