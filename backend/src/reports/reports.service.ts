import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange, Listing } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ReportsService {
    constructor(
        @InjectRepository(Exchange)
        private exchangesRepository: Repository<Exchange>,
        @InjectRepository(Listing)
        private listingsRepository: Repository<Listing>,
    ) {}

    async getUserImpactMetrics(userId: number) {
        // Métricas basadas en lo que el usuario ha vendido (ofrecido a la comunidad)
        const sales = await this.exchangesRepository.find({
            where: { sellerId: userId },
            relations: ['listing', 'listing.category'],
        });

        let reusedItems = 0;
        let co2Saved = 0;
        let serviceHours = 0;

        for (const sale of sales) {
            const isService = sale.listing.category.name.toLowerCase() === 'servicios';
            if (isService) {
                serviceHours += sale.quantity; // Asumimos que la cantidad es en horas para servicios
            } else {
                reusedItems += sale.quantity;
                co2Saved += sale.quantity * Number(sale.listing.category.co2Factor);
            }
        }
        
        return {
            reusedItems,
            co2Saved,
            serviceHours,
        };
    }
}
