-- db/init/05_admin_analytics.sql

-- ==========================================
-- MÓDULO 1: KPIs (Indicadores)
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

CREATE OR REPLACE FUNCTION fn_admin_kpi_operations(p_start DATE, p_end DATE)
RETURNS TABLE (total_listings BIGINT, total_exchanges BIGINT, exchanged_volume BIGINT) AS $$
BEGIN
    RETURN QUERY SELECT
        (SELECT COUNT(*) FROM listings WHERE created_at::date BETWEEN p_start AND p_end),
        (SELECT COUNT(*) FROM exchanges WHERE exchange_date::date BETWEEN p_start AND p_end),
        (SELECT COALESCE(SUM(quantity), 0) FROM exchanges WHERE exchange_date::date BETWEEN p_start AND p_end);
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
-- MÓDULO 3: ECONOMÍA Y MERCADO (NUEVO)
-- ==========================================

-- 1. Oferta vs Demanda (Publicaciones Creadas vs Intercambios Realizados)
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

-- 2. Origen de los Créditos (Inyección Externa vs Circulación Interna)
CREATE OR REPLACE FUNCTION fn_chart_credit_origin(p_start DATE, p_end DATE)
RETURNS TABLE (source_type VARCHAR, total_credits NUMERIC) AS $$
BEGIN
    RETURN QUERY
    -- Créditos comprados (Dinero real -> Créditos)
    SELECT 'Compra Directa (Inyección)'::VARCHAR, COALESCE(SUM(credits), 0)
    FROM credit_purchases WHERE purchase_date::date BETWEEN p_start AND p_end
    UNION ALL
    -- Créditos movidos en intercambios (Economía interna)
    SELECT 'Intercambios (Circulación)'::VARCHAR, COALESCE(SUM(credits_total), 0)
    FROM exchanges WHERE exchange_date::date BETWEEN p_start AND p_end;
END; $$ LANGUAGE plpgsql;

-- 3. Ranking de Usuarios (Gamificación)
-- Score: 10 pts por intercambio, 5 por publicación, 0.5 por cada crédito de impacto generado (simulado con volumen)
CREATE OR REPLACE FUNCTION fn_chart_user_ranking(p_start DATE, p_end DATE)
RETURNS TABLE (
    user_name VARCHAR, 
    score NUMERIC, 
    exchanges_count BIGINT, 
    listings_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.name,
        (
            (COUNT(DISTINCT e.id) * 10) + 
            (COUNT(DISTINCT l.id) * 5) + 
            (COALESCE(SUM(e.credits_total), 0) * 0.1) -- 0.1 pt por crédito movido
        )::NUMERIC as calculated_score,
        COUNT(DISTINCT e.id)::BIGINT,
        COUNT(DISTINCT l.id)::BIGINT
    FROM users u
    LEFT JOIN exchanges e ON (u.id = e.seller_id OR u.id = e.buyer_id) AND e.exchange_date::date BETWEEN p_start AND p_end
    LEFT JOIN listings l ON u.id = l.author_id AND l.created_at::date BETWEEN p_start AND p_end
    WHERE u.role != 'admin' -- Excluir admin del ranking
    GROUP BY u.id, u.name
    ORDER BY calculated_score DESC
    LIMIT 10;
END; $$ LANGUAGE plpgsql;
