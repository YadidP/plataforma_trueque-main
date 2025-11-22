-- db/init/08_fix_reports.sql

-- 1. Modificar tabla claims para permitir reportes de publicaciones
ALTER TABLE claims ALTER COLUMN exchange_id DROP NOT NULL;
ALTER TABLE claims ADD COLUMN IF NOT EXISTS listing_id INT REFERENCES listings(id);

-- 2. Redefinir funciones de reporte para asegurar que existan y sean correctas

-- Función para el Reporte de Monetización
CREATE OR REPLACE FUNCTION fn_report_monetization(start_date DATE, end_date DATE)
RETURNS TABLE (
    revenue_in_period NUMERIC,
    exchanges_in_period BIGINT,
    credits_purchased_in_period NUMERIC,
    credits_exchanged_in_period NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COALESCE(SUM(amount_bs), 0)::NUMERIC FROM credit_purchases WHERE purchase_date::date BETWEEN start_date AND end_date) AS revenue_in_period,
        (SELECT COUNT(*)::BIGINT FROM exchanges WHERE exchange_date::date BETWEEN start_date AND end_date) AS exchanges_in_period,
        (SELECT COALESCE(SUM(credits), 0)::NUMERIC FROM credit_purchases WHERE purchase_date::date BETWEEN start_date AND end_date) AS credits_purchased_in_period,
        (SELECT COALESCE(SUM(credits_total), 0)::NUMERIC FROM exchanges WHERE exchange_date::date BETWEEN start_date AND end_date) AS credits_exchanged_in_period;
END;
$$ LANGUAGE plpgsql;

-- Función para el Reporte de Usuarios
CREATE OR REPLACE FUNCTION fn_report_users(start_date DATE, end_date DATE)
RETURNS TABLE (
    total_users BIGINT,
    new_users_in_period BIGINT,
    active_users_in_period BIGINT,
    inactive_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH user_activity AS (
        SELECT
            u.id,
            u.created_at,
            MAX(cl.log_date) AS last_activity
        FROM users u
        LEFT JOIN credits_log cl ON u.id = cl.user_id
        GROUP BY u.id, u.created_at
    )
    SELECT
        (SELECT COUNT(*) FROM users) AS total_users,
        (SELECT COUNT(*) FROM users WHERE created_at::date BETWEEN start_date AND end_date) AS new_users_in_period,
        (SELECT COUNT(*) FROM user_activity WHERE last_activity::date BETWEEN start_date AND end_date) AS active_users_in_period,
        (SELECT COUNT(*) FROM user_activity WHERE last_activity::date < start_date) AS inactive_users;
END;
$$ LANGUAGE plpgsql;

-- Función para el Reporte de Impacto
CREATE OR REPLACE FUNCTION fn_report_impact(start_date DATE, end_date DATE)
RETURNS TABLE (
    category_name VARCHAR,
    items_exchanged BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.name AS category_name,
        COALESCE(SUM(e.quantity), 0)::BIGINT AS items_exchanged
    FROM categories c
    LEFT JOIN listings l ON c.id = l.category_id
    LEFT JOIN exchanges e ON l.id = e.listing_id AND e.exchange_date::date BETWEEN start_date AND end_date
    GROUP BY c.name
    ORDER BY items_exchanged DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para el Reporte de Reclamos
CREATE OR REPLACE FUNCTION fn_report_claims(start_date DATE, end_date DATE)
RETURNS TABLE (
    status VARCHAR,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cl.status,
        COUNT(*)::BIGINT
    FROM claims cl
    WHERE cl.created_at::date BETWEEN start_date AND end_date
    GROUP BY cl.status;
END;
$$ LANGUAGE plpgsql;
