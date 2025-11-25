// backend/src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { UserReportDto, MonetizationReportDto, ImpactReportDto, ClaimsReportDto, DateRangeDto } from './dto/report-response.dto';
import { PgService } from 'src/database/pg.service'; // Import PgService

@Injectable()
export class ReportsService {
    constructor(private pgService: PgService) { } // Inject PgService

    // Lógica para el Dashboard del Usuario
        async getUserImpactMetrics(userId: number): Promise<any> {
            // 1. Métricas básicas de actividad (Items reutilizados y horas de servicio)
            const basicStatsResult = await this.pgService.query(`
                SELECT
                    COUNT(e.id) as reused_items,
                    COALESCE(SUM(CASE WHEN c.name = 'Servicios' THEN l.quantity * e.quantity ELSE 0 END), 0) as service_hours
                FROM exchanges e
                JOIN listings l ON e.listing_id = l.id
                JOIN categories c ON l.category_id = c.id
                WHERE e.buyer_id = $1 OR e.seller_id = $1
            `, [userId]);
    
            // 2. Impacto Ambiental Real (Sumando desde el historial guardado en exchange_impacts)
            // Esto suma el impacto tanto si compraste como si vendiste (ambos contribuyen a la economía circular)
            const impactResult = await this.pgService.query(`
                SELECT
                    ei.metric_code as code,
                    ei.metric_name as name,
                    ei.metric_unit as unit,
                    COALESCE(SUM(ei.impact_value), 0) as total_value
                FROM exchange_impacts ei
                JOIN exchanges e ON ei.exchange_id = e.id
                WHERE e.buyer_id = $1 OR e.seller_id = $1
                GROUP BY ei.metric_code, ei.metric_name, ei.metric_unit
            `, [userId]);
    
            const stats = basicStatsResult.rows[0];
            const impacts = impactResult.rows;
    
            // Función auxiliar para obtener valor o 0 si no existe
            const getMetricVal = (code: string) => {
                const m = impacts.find((i: any) => i.code === code);
                return m ? parseFloat(m.total_value) : 0;
            };
    
            return {
                reusedItems: parseInt(stats.reused_items, 10) || 0,
                serviceHours: parseFloat(stats.service_hours) || 0,
                co2Saved: getMetricVal('CO2'),
                detailedMetrics: impacts.map((m: any) => ({
                    code: m.code,
                    name: m.name,
                    unit: m.unit,
                    value: parseFloat(m.total_value)
                }))
            };
        }
    // --- Lógica para el Panel de Administración ---

    async getUsersReport(dateRange: DateRangeDto): Promise<UserReportDto> {
        const { startDate, endDate } = this.prepareDates(dateRange);
        const result = await this.pgService.query('SELECT * FROM fn_report_users(, $2)', [startDate, endDate]);
        const data = result.rows[0];
        return {
            totalUsers: parseInt(data.total_users, 10),
            newUsersInPeriod: parseInt(data.new_users_in_period, 10),
            activeUsersInPeriod: parseInt(data.active_users_in_period, 10),
            inactiveUsers: parseInt(data.inactive_users, 10),
        };
    }

    async getMonetizationReport(dateRange: DateRangeDto): Promise<MonetizationReportDto> {
        const { startDate, endDate } = this.prepareDates(dateRange);
        const result = await this.pgService.query('SELECT * FROM fn_report_monetization(, $2)', [startDate, endDate]);
        const data = result.rows[0];
        return {
            revenueInPeriod: parseFloat(data.revenue_in_period),
            exchangesInPeriod: parseInt(data.exchanges_in_period, 10),
            creditsPurchasedInPeriod: parseFloat(data.credits_purchased_in_period),
            creditsExchangedInPeriod: parseFloat(data.credits_exchanged_in_period),
        };
    }

    async getImpactReport(dateRange: DateRangeDto): Promise<ImpactReportDto> {
        const { startDate, endDate } = this.prepareDates(dateRange);
        const result = await this.pgService.query('SELECT * FROM fn_report_impact(, $2)', [startDate, endDate]);
        return {
            impactByCategory: result.rows.map((row: any) => ({
                categoryName: row.category_name,
                itemsExchanged: parseInt(row.items_exchanged, 10),
            })),
        };
    }

    async getClaimsReport(dateRange: DateRangeDto): Promise<ClaimsReportDto> {
        const { startDate, endDate } = this.prepareDates(dateRange);
        const result = await this.pgService.query('SELECT * FROM fn_report_claims(, $2)', [startDate, endDate]);
        return {
            claimsByStatus: result.rows.map((row: any) => ({
                status: row.status,
                count: parseInt(row.count, 10),
            })),
        };
    }

    async getAdvancedMetrics(): Promise<any> {
        const trendsResult = await this.pgService.query('SELECT * FROM fn_report_monthly_trends()');
        const topUsersResult = await this.pgService.query('SELECT * FROM fn_report_top_users()');

        return {
            trends: trendsResult.rows.map((row: any) => ({
                monthLabel: row.month_label,
                revenue: Number(row.revenue),
                newUsers: Number(row.new_users),
                churnedUsers: Number(row.churned_users),
                activeUsers: Number(row.active_users),
            })),
            topUsers: topUsersResult.rows.map((row: any) => ({
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