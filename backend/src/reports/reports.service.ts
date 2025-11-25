// backend/src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserReportDto, MonetizationReportDto, ImpactReportDto, ClaimsReportDto, DateRangeDto } from './dto/report-response.dto';

@Injectable()
export class ReportsService {
    constructor(private dataSource: DataSource) { }

    // Lógica para el Dashboard del Usuario
    async getUserImpactMetrics(userId: number): Promise<any> {
        // 1. Obtener métricas básicas (reusedItems, serviceHours)
        const basicStats = await this.dataSource.query(`
            SELECT 
                COUNT(e.id) as reused_items,
                COALESCE(SUM(CASE WHEN c.name = 'Servicios' THEN l.quantity * e.quantity ELSE 0 END), 0) as service_hours
            FROM exchanges e
            JOIN listings l ON e.listing_id = l.id
            JOIN categories c ON l.category_id = c.id
            WHERE e.buyer_id = $1 OR e.seller_id = $1
        `, [userId]);

        // 2. Calcular impacto detallado usando equivalencias
        const detailedImpact = await this.dataSource.query(`
            SELECT
                im.code,
                im.name,
                im.unit,
                SUM(
                    (e.quantity * l.quantity) / ie.base_quantity * ie.impact_value
                ) as value
            FROM exchanges e
            JOIN listings l ON e.listing_id = l.id
            JOIN impact_equivalences ie ON l.material_id = ie.material_id
            JOIN impact_metrics im ON ie.metric_id = im.id
            WHERE e.buyer_id = $1 OR e.seller_id = $1
            GROUP BY im.code, im.name, im.unit
        `, [userId]);

        const stats = basicStats[0];
        const co2Metric = detailedImpact.find((m: any) => m.code === 'CO2');

        return {
            reusedItems: parseInt(stats.reused_items, 10) || 0,
            serviceHours: parseFloat(stats.service_hours) || 0,
            co2Saved: co2Metric ? parseFloat(co2Metric.value) : 0,
            detailedMetrics: detailedImpact.map((m: any) => ({
                code: m.code,
                name: m.name,
                unit: m.unit,
                value: parseFloat(m.value)
            }))
        };
    }

    // --- Lógica para el Panel de Administración ---

    async getUsersReport(dateRange: DateRangeDto): Promise<UserReportDto> {
        const { startDate, endDate } = this.prepareDates(dateRange);
        const result = await this.dataSource.query('SELECT * FROM fn_report_users($1, $2)', [startDate, endDate]);
        const data = result[0];
        return {
            totalUsers: parseInt(data.total_users, 10),
            newUsersInPeriod: parseInt(data.new_users_in_period, 10),
            activeUsersInPeriod: parseInt(data.active_users_in_period, 10),
            inactiveUsers: parseInt(data.inactive_users, 10),
        };
    }

    async getMonetizationReport(dateRange: DateRangeDto): Promise<MonetizationReportDto> {
        const { startDate, endDate } = this.prepareDates(dateRange);
        const result = await this.dataSource.query('SELECT * FROM fn_report_monetization($1, $2)', [startDate, endDate]);
        const data = result[0];
        return {
            revenueInPeriod: parseFloat(data.revenue_in_period),
            exchangesInPeriod: parseInt(data.exchanges_in_period, 10),
            creditsPurchasedInPeriod: parseFloat(data.credits_purchased_in_period),
            creditsExchangedInPeriod: parseFloat(data.credits_exchanged_in_period),
        };
    }

    async getImpactReport(dateRange: DateRangeDto): Promise<ImpactReportDto> {
        const { startDate, endDate } = this.prepareDates(dateRange);
        const result = await this.dataSource.query('SELECT * FROM fn_report_impact($1, $2)', [startDate, endDate]);
        return {
            impactByCategory: result.map((row: any) => ({
                categoryName: row.category_name,
                itemsExchanged: parseInt(row.items_exchanged, 10),
            })),
        };
    }

    async getClaimsReport(dateRange: DateRangeDto): Promise<ClaimsReportDto> {
        const { startDate, endDate } = this.prepareDates(dateRange);
        const result = await this.dataSource.query('SELECT * FROM fn_report_claims($1, $2)', [startDate, endDate]);
        return {
            claimsByStatus: result.map((row: any) => ({
                status: row.status,
                count: parseInt(row.count, 10),
            })),
        };
    }

    async getAdvancedMetrics(): Promise<any> {
        const trendsResult = await this.dataSource.query('SELECT * FROM fn_report_monthly_trends()');
        const topUsersResult = await this.dataSource.query('SELECT * FROM fn_report_top_users()');

        return {
            trends: trendsResult.map((row: any) => ({
                monthLabel: row.month_label,
                revenue: Number(row.revenue),
                newUsers: Number(row.new_users),
                churnedUsers: Number(row.churned_users),
                activeUsers: Number(row.active_users),
            })),
            topUsers: topUsersResult.map((row: any) => ({
                userName: row.user_name,
                score: Number(row.score),
                exchangesCount: Number(row.exchanges_count),
                creditsGenerated: Number(row.credits_generated),
            })),
        };
    }

    /**
     * Prepara las fechas. Si no se proveen, usa un rango por defecto (ej. últimos 30 días).
     */
    private prepareDates(dateRange: DateRangeDto): { startDate: string, endDate: string } {
        const endDate = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
        const startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date(new Date().setDate(endDate.getDate() - 30));

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };
    }
}