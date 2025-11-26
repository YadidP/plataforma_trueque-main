import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';

@Injectable()
export class AdminService {
    constructor(private readonly pgService: PgService) { }

    // 1. OBTENER RESUMEN DE KPIs (MODIFICADO)
    async getKpiSummary(startDate: string, endDate: string) {
        const [usersRes, revenueRes, opsRes, claimsRes] = await Promise.all([
            this.pgService.query('SELECT * FROM fn_admin_kpi_users($1, $2)', [startDate, endDate]),
            this.pgService.query('SELECT * FROM fn_admin_kpi_revenue($1, $2)', [startDate, endDate]),
            this.pgService.query('SELECT * FROM fn_admin_kpi_operations($1, $2)', [startDate, endDate]),
            // Query directa para reclamos (Pending vs Resolved)
            this.pgService.query(`
                SELECT 
                    COUNT(*) FILTER (WHERE status IN ('abierto', 'en_revision')) as pending,
                    COUNT(*) FILTER (WHERE status = 'resuelto') as resolved
                FROM claims
            `) 
        ]);

        return {
            users: usersRes.rows[0],
            revenue: revenueRes.rows[0],
            operations: opsRes.rows[0],
            claims: claimsRes.rows[0] // Nuevo campo
        };
    }

    // ... (El resto de métodos se mantienen igual: getUsersList, getUserDynamics, etc.) ...
    async getUsersList() { return (await this.pgService.query('SELECT * FROM view_admin_users_list')).rows; }
    async getFinanceList() { return (await this.pgService.query('SELECT * FROM view_admin_finance_list')).rows; }
    async getListingsList() {
        return (await this.pgService.query(`SELECT l.id, l.title, u.name as author, c.name as category, l.unit_credits, l.status, l.created_at FROM listings l JOIN users u ON l.author_id = u.id JOIN categories c ON l.category_id = c.id ORDER BY l.created_at DESC`)).rows;
    }
    async getExchangesList() {
        return (await this.pgService.query(`SELECT e.id, l.title as product, ub.name as buyer, us.name as seller, e.credits_total as "totalCredits", e.exchange_date as "date" FROM exchanges e JOIN listings l ON e.listing_id = l.id JOIN users ub ON e.buyer_id = ub.id JOIN users us ON e.seller_id = us.id ORDER BY e.exchange_date DESC`)).rows;
    }
    async getUserDynamics(startDate: string, endDate: string, roleFilter: string = 'ALL') {
        const [flowRes, distRes, growthRes] = await Promise.all([
            this.pgService.query('SELECT * FROM fn_chart_user_flow($1, $2)', [startDate, endDate]),
            this.pgService.query('SELECT * FROM fn_chart_user_distribution($1, $2, $3)', [startDate, endDate, roleFilter]),
            this.pgService.query('SELECT * FROM fn_chart_growth_rate($1, $2)', [startDate, endDate])
        ]);
        return {
            flow: flowRes.rows.map(r => ({ ...r, new_users: Number(r.new_users), active_users: Number(r.active_users) })),
            distribution: distRes.rows.map(r => ({ ...r, count: Number(r.count) })),
            growth: growthRes.rows.map(r => ({ ...r, total_users: Number(r.total_users), growth_rate: Number(r.growth_rate) }))
        };
    }
    async getEconomyData(startDate: string, endDate: string) {
        const [supplyRes, originRes, rankingRes] = await Promise.all([
            this.pgService.query('SELECT * FROM fn_chart_supply_demand($1, $2)', [startDate, endDate]),
            this.pgService.query('SELECT * FROM fn_chart_credit_origin($1, $2)', [startDate, endDate]),
            this.pgService.query('SELECT * FROM fn_chart_user_ranking($1, $2)', [startDate, endDate])
        ]);
        return {
            supplyDemand: supplyRes.rows.map(r => ({ month_label: r.month_label, listings_count: Number(r.listings_count), exchanges_count: Number(r.exchanges_count) })),
            creditOrigin: originRes.rows.map(r => ({ source_type: r.source_type, total_credits: Number(r.total_credits) })),
            ranking: rankingRes.rows.map(r => ({ ...r, score: Number(r.score).toFixed(1), exchanges_count: Number(r.exchanges_count), listings_count: Number(r.listings_count) }))
        };
    }
    async getImpactData(startDate: string, endDate: string, metric: string) {
        const totalsRes = await this.pgService.query('SELECT * FROM fn_chart_impact_totals($1, $2)', [startDate, endDate]);
        let catQuery = '';
        let params: any[] = [];
        if (metric === 'COUNT') {
            catQuery = `WITH cat_base AS (SELECT id, name FROM categories) SELECT c.name as category_name, (SELECT COUNT(*) FROM listings l WHERE l.category_id = c.id AND l.created_at::date BETWEEN $1 AND $2) as potential_val, (SELECT COUNT(*) FROM exchanges e JOIN listings l ON e.listing_id = l.id WHERE l.category_id = c.id AND e.exchange_date::date BETWEEN $1 AND $2) as real_val FROM cat_base c ORDER BY real_val DESC;`;
            params = [startDate, endDate];
        } else {
            catQuery = `WITH categories_base AS (SELECT id, name FROM categories), real_impact AS (SELECT l.category_id, SUM(ei.impact_value) as real_val FROM exchange_impacts ei JOIN exchanges e ON ei.exchange_id = e.id JOIN listings l ON e.listing_id = l.id WHERE ei.metric_code = $3 AND e.exchange_date::date BETWEEN $1 AND $2 GROUP BY l.category_id), potential_impact AS (SELECT l.category_id, SUM( (l.quantity / ie.base_quantity) * ie.impact_value ) as pot_val FROM listings l JOIN impact_equivalences ie ON l.material_id = ie.material_id AND ie.base_unit = l.unit_label JOIN impact_metrics im ON ie.metric_id = im.id WHERE im.code = $3 AND l.created_at::date BETWEEN $1 AND $2 GROUP BY l.category_id) SELECT c.name as category_name, COALESCE(pi.pot_val, 0) as potential_val, COALESCE(ri.real_val, 0) as real_val FROM categories_base c LEFT JOIN potential_impact pi ON c.id = pi.category_id LEFT JOIN real_impact ri ON c.id = ri.category_id WHERE COALESCE(pi.pot_val, 0) > 0 OR COALESCE(ri.real_val, 0) > 0 ORDER BY pi.pot_val DESC;`;
            params = [startDate, endDate, metric];
        }
        const catRes = await this.pgService.query(catQuery, params);
        return { totals: totalsRes.rows.map(r => ({ ...r, total_value: Number(r.total_value) })), byCategory: catRes.rows.map(r => ({ category_name: r.category_name, potential_val: Number(r.potential_val), real_val: Number(r.real_val) })) };
    }
}