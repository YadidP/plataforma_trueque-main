import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Exchange, Listing } from 'src/entities';
import { DataSource, Repository } from 'typeorm';
import { UserReportDto, MonetizationReportDto, ImpactReportDto } from './dto/report-response.dto';

@Injectable()
export class ReportsService {
    constructor(
        private dataSource: DataSource,
        @InjectRepository(Exchange)
        private exchangesRepository: Repository<Exchange>,
        @InjectRepository(Listing)
        private listingsRepository: Repository<Listing>,
    ) {}

    // --- Lógica para el Dashboard del Usuario ---
    async getUserImpactMetrics(userId: number) {
        const sales = await this.exchangesRepository.find({
            where: { sellerId: userId },
            relations: ['listing', 'listing.category'],
        });

        let reusedItems = 0;
        let serviceHours = 0;
        
        // Inicializamos todas las métricas en 0
        let co2Saved = 0;
        let waterSaved = 0;
        let energySaved = 0;
        let wastePrevented = 0;

        for (const sale of sales) {
            const isService = sale.listing.category.name.toLowerCase() === 'servicios';
            if (isService) {
                serviceHours += sale.quantity;
            } else {
                reusedItems += sale.quantity;
            }
        }
        
        return {
            reusedItems,
            co2Saved,
            serviceHours,
            waterSaved,
            waterUnit: 'litros',
            energySaved,
            energyUnit: 'kWh',
            wastePrevented,
            wasteUnit: 'kg',
            co2Unit: 'kg',
        };
    }

    // --- Lógica para el Panel de Administración ---

    async getUsersReport(): Promise<UserReportDto> {
        const totalUsers = await this.dataSource.query('SELECT COUNT(*) FROM users');
        
        const activeUsersByRole = await this.dataSource.query(`
            SELECT role, COUNT(*) as count
            FROM view_user_reports
            WHERE is_active_last_30_days = TRUE
            GROUP BY role
        `);

        const top10UsersByExchanges = await this.dataSource.query(`
            SELECT user_id, name, email, total_exchanges
            FROM view_user_reports
            ORDER BY total_exchanges DESC
            LIMIT 10
        `);

        const churnUsersCount = await this.dataSource.query(`
            SELECT COUNT(*) FROM view_user_reports WHERE is_churn_last_60_days = TRUE
        `);

        return {
            totalUsers: parseInt(totalUsers[0].count, 10),
            activeUsers: activeUsersByRole.map(r => ({ ...r, count: parseInt(r.count, 10) })),
            top10UsersByExchanges,
            churnUsersCount: parseInt(churnUsersCount[0].count, 10),
        };
    }

    async getMonetizationReport(): Promise<MonetizationReportDto> {
        const result = await this.dataSource.query('SELECT * FROM view_monetization_reports');
        const data = result[0];

        const totalRevenue = parseFloat(data.total_revenue_credit_sales) + parseFloat(data.total_revenue_subscriptions);
        const revenueLast30Days = parseFloat(data.revenue_credit_sales_last_30_days) + parseFloat(data.revenue_subscriptions_last_30_days);

        return {
            totalRevenue,
            revenueLast30Days,
            creditSource: [
                { source: 'Compras', amount: parseFloat(data.credits_from_purchase) },
                { source: 'Intercambios', amount: parseFloat(data.credits_from_exchanges) },
                { source: 'Incentivos', amount: parseFloat(data.credits_from_incentives) },
                { source: 'Bienvenida', amount: parseFloat(data.credits_from_welcome_bonus) },
            ],
            activePremiumUsers: parseInt(data.active_premium_users, 10),
        };
    }

    async getImpactReport(): Promise<ImpactReportDto> {
        const impactByCategory = await this.dataSource.query(`
            SELECT category_name, total_exchanges, total_items_exchanged, listing_to_exchange_ratio
            FROM view_impact_reports
            ORDER BY total_exchanges DESC
        `);
        
        const totalItemsExchanged = impactByCategory.reduce((sum, cat) => sum + parseInt(cat.total_items_exchanged || '0', 10), 0);
        
        return {
            totalItemsExchanged,
            exchangesByCategory: impactByCategory.map(c => ({ categoryName: c.category_name, totalExchanges: parseInt(c.total_exchanges, 10) })),
            listingToExchangeRatioByCategory: impactByCategory.map(c => ({ categoryName: c.category_name, ratio: parseFloat(c.listing_to_exchange_ratio) })),
        };
    }
}