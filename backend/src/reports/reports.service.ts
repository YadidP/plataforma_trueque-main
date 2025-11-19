// backend/src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserReportDto, MonetizationReportDto, ImpactReportDto, ClaimsReportDto, DateRangeDto } from './dto/report-response.dto';

@Injectable()
export class ReportsService {
    constructor(private dataSource: DataSource) { }

    // Lógica para el Dashboard del Usuario (sin cambios)
    async getUserImpactMetrics(userId: number): Promise<any> {
        // ... tu lógica actual para el impacto personal ...
        return { reusedItems: 10, co2Saved: 15.5, serviceHours: 5 }; // Ejemplo
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
            impactByCategory: result.map(row => ({
                categoryName: row.category_name,
                itemsExchanged: parseInt(row.items_exchanged, 10),
            })),
        };
    }

    async getClaimsReport(dateRange: DateRangeDto): Promise<ClaimsReportDto> {
        const { startDate, endDate } = this.prepareDates(dateRange);
        const result = await this.dataSource.query('SELECT * FROM fn_report_claims($1, $2)', [startDate, endDate]);
        return {
            claimsByStatus: result.map(row => ({
                status: row.status,
                count: parseInt(row.count, 10),
            })),
        };
    }

    async getAdvancedMetrics(): Promise<any> {
        const trendsResult = await this.dataSource.query('SELECT * FROM fn_report_monthly_trends()');
        const topUsersResult = await this.dataSource.query('SELECT * FROM fn_report_top_users()');

        return {
            trends: trendsResult.map(row => ({
                monthLabel: row.month_label,
                revenue: Number(row.revenue),
                newUsers: Number(row.new_users),
                churnedUsers: Number(row.churned_users),
                activeUsers: Number(row.active_users),
            })),
            topUsers: topUsersResult.map(row => ({
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