-- db/init/05_admin_analytics.sql

-- ==========================================
-- MÓDULO 1: KPIs
-- ==========================================
CREATE OR REPLACE FUNCTION fn_admin_kpi_users(p_start DATE, p_end DATE)
RETURNS TABLE (total_users BIGINT, new_users BIGINT, users_free BIGINT, users_pro BIGINT, users_leader BIGINT) AS $$
BEGIN
    RETURN QUERY SELECT
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM users WHERE created_at::date BETWEEN p_start AND p_end),
        (SELECT COUNT(*) FROM user_subscriptions us JOIN subscriptions s ON us.subscription_id = s.id WHERE us.is_active = true AND s.priority = 0),
        (SELECT COUNT(*) FROM user_subscriptions us JOIN subscriptions s ON us.subscription_id = s.id WHERE us.is_active = true AND s.priority = 1),
        (SELECT COUNT(*) FROM user_subscriptions us JOIN subscriptions s ON us.subscription_id = s.id WHERE us.is_active = true AND s.priority = 2);
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_admin_kpi_revenue(p_start DATE, p_end DATE)
RETURNS TABLE (total_revenue NUMERIC, revenue_credits NUMERIC, revenue_subscriptions NUMERIC) AS $$
BEGIN
    RETURN QUERY SELECT
        COALESCE(SUM(amount_bs), 0),
        COALESCE(SUM(CASE WHEN credits > 0 THEN amount_bs ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN credits = 0 THEN amount_bs ELSE 0 END), 0)
    FROM credit_purchases WHERE purchase_date::date BETWEEN p_start AND p_end;
END; $$ LANGUAGE plpgsql;

DROP FUNCTION IF EXISTS fn_admin_kpi_operations(DATE, DATE);

CREATE OR REPLACE FUNCTION fn_admin_kpi_operations(p_start DATE, p_end DATE)
RETURNS TABLE (total_listings BIGINT, total_exchanges BIGINT, exchanged_volume BIGINT, total_claims BIGINT) AS $$
BEGIN
    RETURN QUERY SELECT
        (SELECT COUNT(*) FROM listings WHERE created_at::date BETWEEN p_start AND p_end),
        (SELECT COUNT(*) FROM exchanges WHERE exchange_date::date BETWEEN p_start AND p_end),
        (SELECT COALESCE(SUM(quantity), 0) FROM exchanges WHERE exchange_date::date BETWEEN p_start AND p_end),
        (SELECT COUNT(*) FROM claims WHERE created_at::date BETWEEN p_start AND p_end); -- Nuevo indicador
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW view_admin_users_list AS
SELECT u.id, u.name, u.email, u.role, u.created_at, w.balance as wallet_balance, COALESCE(s.name, 'Sin Plan') as plan_name
FROM users u LEFT JOIN wallets w ON u.id = w.user_id LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.is_active = true LEFT JOIN subscriptions s ON us.subscription_id = s.id ORDER BY u.created_at DESC;

CREATE OR REPLACE VIEW view_admin_finance_list AS
SELECT cp.id, u.name as user_name, cp.amount_bs, cp.purchase_date, CASE WHEN cp.credits > 0 THEN 'Compra Créditos' ELSE 'Suscripción' END as type, cp.payment_ref
FROM credit_purchases cp JOIN users u ON cp.user_id = u.id ORDER BY cp.purchase_date DESC;

-- ==========================================
-- MÓDULO 2: DINÁMICA DE USUARIOS
-- ==========================================
CREATE OR REPLACE FUNCTION fn_chart_user_flow(p_start DATE, p_end DATE)
RETURNS TABLE (month_label TEXT, new_users BIGINT, active_users BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT TO_CHAR(d_month, 'YYYY-MM'),
        (SELECT COUNT(*) FROM users WHERE DATE_TRUNC('month', created_at) = d_month),
        (SELECT COUNT(DISTINCT user_id) FROM credits_log WHERE DATE_TRUNC('month', log_date) = d_month)
    FROM GENERATE_SERIES(DATE_TRUNC('month', p_start), DATE_TRUNC('month', p_end), '1 month'::interval) AS d_month;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_chart_user_distribution(p_start DATE, p_end DATE, p_role VARCHAR DEFAULT 'ALL')
RETURNS TABLE (status VARCHAR, count BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH user_scope AS (SELECT id, created_at FROM users WHERE (p_role = 'ALL' OR role = p_role)),
    activity AS (SELECT DISTINCT user_id FROM credits_log WHERE log_date::date BETWEEN p_start AND p_end)
    SELECT 'Nuevos'::VARCHAR, COUNT(*) FROM user_scope WHERE created_at::date BETWEEN p_start AND p_end
    UNION ALL
    SELECT 'Activos'::VARCHAR, COUNT(*) FROM user_scope u JOIN activity a ON u.id = a.user_id WHERE u.created_at < p_start
    UNION ALL
    SELECT 'Inactivos'::VARCHAR, COUNT(*) FROM user_scope u WHERE u.id NOT IN (SELECT user_id FROM activity) AND u.created_at < p_start;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_chart_growth_rate(p_start DATE, p_end DATE)
RETURNS TABLE (month_label TEXT, total_users BIGINT, growth_rate NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_counts AS (
        SELECT DATE_TRUNC('month', d_month) as m_date, (SELECT COUNT(*) FROM users WHERE created_at < (d_month + INTERVAL '1 month')) as running_total
        FROM GENERATE_SERIES(DATE_TRUNC('month', p_start), DATE_TRUNC('month', p_end), '1 month'::interval) AS d_month
    )
    SELECT TO_CHAR(m_date, 'YYYY-MM'), running_total,
        CASE WHEN LAG(running_total) OVER (ORDER BY m_date) = 0 THEN 100.0 WHEN LAG(running_total) OVER (ORDER BY m_date) IS NULL THEN 0.0
        ELSE ROUND(((running_total - LAG(running_total) OVER (ORDER BY m_date))::NUMERIC / LAG(running_total) OVER (ORDER BY m_date)) * 100, 2) END
    FROM monthly_counts;
END; $$ LANGUAGE plpgsql;

-- ==========================================
-- MÓDULO 3: ECONOMÍA Y MERCADO
-- ==========================================
CREATE OR REPLACE FUNCTION fn_chart_supply_demand(p_start DATE, p_end DATE)
RETURNS TABLE (month_label TEXT, listings_count BIGINT, exchanges_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        TO_CHAR(d_month, 'YYYY-MM'),
        (SELECT COUNT(*) FROM listings WHERE DATE_TRUNC('month', created_at) = d_month),
        (SELECT COUNT(*) FROM exchanges WHERE DATE_TRUNC('month', exchange_date) = d_month)
    FROM GENERATE_SERIES(DATE_TRUNC('month', p_start), DATE_TRUNC('month', p_end), '1 month'::interval) AS d_month;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_chart_credit_origin(p_start DATE, p_end DATE)
RETURNS TABLE (source_type VARCHAR, total_credits NUMERIC) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Compra Directa (Inyección)'::VARCHAR, COALESCE(SUM(credits), 0)
    FROM credit_purchases WHERE purchase_date::date BETWEEN p_start AND p_end
    UNION ALL
    SELECT 'Intercambios (Circulación)'::VARCHAR, COALESCE(SUM(credits_total), 0)
    FROM exchanges WHERE exchange_date::date BETWEEN p_start AND p_end;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_chart_user_ranking(p_start DATE, p_end DATE)
RETURNS TABLE (user_name VARCHAR, score NUMERIC, exchanges_count BIGINT, listings_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT u.name, ((COUNT(DISTINCT e.id) * 10) + (COUNT(DISTINCT l.id) * 5) + (COALESCE(SUM(e.credits_total), 0) * 0.1))::NUMERIC as calculated_score,
        COUNT(DISTINCT e.id)::BIGINT, COUNT(DISTINCT l.id)::BIGINT
    FROM users u
    LEFT JOIN exchanges e ON (u.id = e.seller_id OR u.id = e.buyer_id) AND e.exchange_date::date BETWEEN p_start AND p_end
    LEFT JOIN listings l ON u.id = l.author_id AND l.created_at::date BETWEEN p_start AND p_end
    WHERE u.role != 'admin'
    GROUP BY u.id, u.name ORDER BY calculated_score DESC LIMIT 10;
END; $$ LANGUAGE plpgsql;


-- ==========================================
-- MÓDULO 4: IMPACTO AMBIENTAL (NUEVO)
-- ==========================================

-- 1. Métricas Totales Acumuladas (Radar Chart / Barras)
CREATE OR REPLACE FUNCTION fn_chart_impact_totals(p_start DATE, p_end DATE)
RETURNS TABLE (metric_code VARCHAR, metric_name VARCHAR, total_value NUMERIC, metric_unit VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ei.metric_code,
        ei.metric_name,
        SUM(ei.impact_value)::NUMERIC,
        ei.metric_unit
    FROM exchange_impacts ei
    JOIN exchanges e ON ei.exchange_id = e.id
    WHERE e.exchange_date::date BETWEEN p_start AND p_end
    GROUP BY ei.metric_code, ei.metric_name, ei.metric_unit
    ORDER BY total_value DESC;
END; $$ LANGUAGE plpgsql;

-- 2. Impacto por Categoría: Potencial vs Real (Enfocado en CO2 para ser comparable)
CREATE OR REPLACE FUNCTION fn_chart_impact_by_category(p_start DATE, p_end DATE)
RETURNS TABLE (category_name VARCHAR, potential_co2 NUMERIC, real_co2 NUMERIC) AS $$
BEGIN
    RETURN QUERY
    WITH categories_base AS (SELECT id, name FROM categories),
    
    -- Impacto Real: Lo que se vendió (tabla exchanges -> exchange_impacts)
    real_impact AS (
        SELECT l.category_id, SUM(ei.impact_value) as co2_val
        FROM exchange_impacts ei
        JOIN exchanges e ON ei.exchange_id = e.id
        JOIN listings l ON e.listing_id = l.id
        WHERE ei.metric_code = 'CO2' AND e.exchange_date::date BETWEEN p_start AND p_end
        GROUP BY l.category_id
    ),
    
    -- Impacto Potencial: Lo que se publicó (tabla listings -> calculo manual con equivalencias)
    potential_impact AS (
        SELECT l.category_id, SUM( (l.quantity / ie.base_quantity) * ie.impact_value ) as co2_val
        FROM listings l
        JOIN impact_equivalences ie ON l.material_id = ie.material_id AND ie.base_unit = l.unit_label
        JOIN impact_metrics im ON ie.metric_id = im.id
        WHERE im.code = 'CO2' AND l.created_at::date BETWEEN p_start AND p_end
        GROUP BY l.category_id
    )
    
    SELECT 
        c.name,
        COALESCE(pi.co2_val, 0)::NUMERIC,
        COALESCE(ri.co2_val, 0)::NUMERIC
    FROM categories_base c
    LEFT JOIN potential_impact pi ON c.id = pi.category_id
    LEFT JOIN real_impact ri ON c.id = ri.category_id
    WHERE COALESCE(pi.co2_val, 0) > 0 OR COALESCE(ri.co2_val, 0) > 0 -- Mostrar solo categorías con movimiento
    ORDER BY pi.co2_val DESC;
END; $$ LANGUAGE plpgsql;