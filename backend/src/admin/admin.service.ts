import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../entities/listing.entity';
import { Exchange } from '../entities/exchange.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Listing)
        private listingsRepository: Repository<Listing>,
        @InjectRepository(Exchange)
        private exchangesRepository: Repository<Exchange>,
    ) { }

    async getPublicationsCount(): Promise<{ total: number }> {
        const count = await this.listingsRepository.count();
        return { total: count };
    }

    async getPublicationsVsExchanges(startDate?: string, endDate?: string): Promise<any[]> {
        // If no dates provided, use last 6 months
        const end = endDate ? new Date(endDate) : new Date();
        const start = startDate ? new Date(startDate) : new Date(new Date().setMonth(end.getMonth() - 6));

        const query = `
            WITH months AS (
                SELECT 
                    DATE_TRUNC('month', generate_series($1::date, $2::date, '1 month'::interval)) AS month
            )
            SELECT 
                TO_CHAR(m.month, 'Mon YYYY') as month_label,
                COALESCE(l.listings_count, 0) as listings_count,
                COALESCE(e.exchanges_count, 0) as exchanges_count
            FROM months m
            LEFT JOIN (
                SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as listings_count
                FROM listings
                WHERE created_at BETWEEN $1 AND $2
                GROUP BY DATE_TRUNC('month', created_at)
            ) l ON m.month = l.month
            LEFT JOIN (
                SELECT DATE_TRUNC('month', exchange_date) as month, COUNT(*) as exchanges_count
                FROM exchanges
                WHERE exchange_date BETWEEN $1 AND $2
                GROUP BY DATE_TRUNC('month', exchange_date)
            ) e ON m.month = e.month
            ORDER BY m.month ASC
        `;

        const result = await this.listingsRepository.query(query, [
            start.toISOString().split('T')[0],
            end.toISOString().split('T')[0]
        ]);

        return result.map(row => ({
            monthLabel: row.month_label,
            listingsCount: parseInt(row.listings_count, 10),
            exchangesCount: parseInt(row.exchanges_count, 10),
        }));
    }
}

