import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service'; // Import PgService

@Injectable()
export class AdminService {
    constructor(
        private readonly pgService: PgService, // Inject PgService
    ) { }

    async getPublicationsCount(): Promise<{ total: number }> {
        const result = await this.pgService.query('SELECT COUNT(*) as total FROM listings;');
        return { total: parseInt(result.rows[0].total, 10) };
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

        const result = await this.pgService.query(query, [
            start.toISOString().split('T')[0],
            end.toISOString().split('T')[0]
        ]);

        return result.rows.map(row => ({
            monthLabel: row.month_label,
            listingsCount: parseInt(row.listings_count, 10),
            exchangesCount: parseInt(row.exchanges_count, 10),
        }));
    }
}

