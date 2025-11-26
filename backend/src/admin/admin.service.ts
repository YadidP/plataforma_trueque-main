import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';

@Injectable()
export class AdminService {
    constructor(private readonly pgService: PgService) { }

    // 1. OBTENER RESUMEN DE KPIs (MÓDULO 1)
    async getKpiSummary(startDate: string, endDate: string) {
        const [usersRes, revenueRes, opsRes] = await Promise.all([
            this.pgService.query('SELECT * FROM fn_admin_kpi_users($1, $2)', [startDate, endDate]),
            this.pgService.query('SELECT * FROM fn_admin_kpi_revenue($1, $2)', [startDate, endDate]),
            this.pgService.query('SELECT * FROM fn_admin_kpi_operations($1, $2)', [startDate, endDate]),
        ]);

        return {
            users: usersRes.rows[0],
            revenue: revenueRes.rows[0],
            operations: opsRes.rows[0]
        };
    }

    // 2. LISTAS DETALLADAS (Para los modales)
    async getUsersList() {
        const res = await this.pgService.query('SELECT * FROM view_admin_users_list');
        return res.rows;
    }

    async getFinanceList() {
        const res = await this.pgService.query('SELECT * FROM view_admin_finance_list');
        return res.rows;
    }

    async getListingsList() {
        const query = `
            SELECT l.id, l.title, u.name as author, c.name as category, l.unit_credits, l.status, l.created_at
            FROM listings l
            JOIN users u ON l.author_id = u.id
            JOIN categories c ON l.category_id = c.id
            ORDER BY l.created_at DESC
        `;
        const res = await this.pgService.query(query);
        return res.rows;
    }

    async getExchangesList() {
        const query = `
            SELECT e.id, l.title as product, ub.name as buyer, us.name as seller, e.credits_total as "totalCredits", e.exchange_date as "date"
            FROM exchanges e
            JOIN listings l ON e.listing_id = l.id
            JOIN users ub ON e.buyer_id = ub.id
            JOIN users us ON e.seller_id = us.id
            ORDER BY e.exchange_date DESC
        `;
        const res = await this.pgService.query(query);
        return res.rows;
    }

    // 3. MÓDULO 2: GRÁFICOS DE DINÁMICA (CORREGIDO)
    async getUserDynamics(startDate: string, endDate: string, roleFilter: string = 'ALL') {
        const [flowRes, distRes, growthRes] = await Promise.all([
            // 1. Flujo
            this.pgService.query('SELECT * FROM fn_chart_user_flow($1, $2)', [startDate, endDate]),
            // 2. Distribución
            this.pgService.query('SELECT * FROM fn_chart_user_distribution($1, $2, $3)', [startDate, endDate, roleFilter]),
            // 3. Crecimiento
            this.pgService.query('SELECT * FROM fn_chart_growth_rate($1, $2)', [startDate, endDate])
        ]);

        return {
            // IMPORTANTE: Convertimos a Number explícitamente
            flow: flowRes.rows.map(r => ({
                ...r,
                new_users: Number(r.new_users),
                active_users: Number(r.active_users)
            })),
            distribution: distRes.rows.map(r => ({
                ...r,
                count: Number(r.count) // Esto arregla el gráfico de torta en blanco
            })),
            growth: growthRes.rows.map(r => ({
                ...r,
                total_users: Number(r.total_users),
                growth_rate: Number(r.growth_rate)
            }))
        };
    }
}
