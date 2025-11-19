-- Función para Tendencias Mensuales (Últimos 12 meses)
-- Sirve para: Ingresos por Mes, Usuarios Nuevos vs Abandonos
CREATE OR REPLACE FUNCTION fn_report_monthly_trends()
RETURNS TABLE (
    month_label TEXT,
    revenue NUMERIC,
    new_users BIGINT,
    churned_users BIGINT,
    active_users BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        TO_CHAR(dates.d, 'YYYY-MM') AS month_label,
        -- Ingresos (Revenue)
        COALESCE(SUM(cp.amount_bs), 0) AS revenue,
        -- Usuarios Nuevos
        COUNT(DISTINCT u.id) FILTER (WHERE TO_CHAR(u.created_at, 'YYYY-MM') = TO_CHAR(dates.d, 'YYYY-MM')) AS new_users,
        -- Usuarios Abandonos (Sin actividad en los ultimos 3 meses desde esa fecha)
        -- *Simplificación lógica para el reporte visual*
        (
             SELECT COUNT(*) 
             FROM users u2 
             WHERE u2.created_at < dates.d 
             AND NOT EXISTS (
                SELECT 1 FROM credits_log cl 
                WHERE cl.user_id = u2.id 
                AND cl.log_date BETWEEN dates.d - INTERVAL '3 months' AND dates.d
             )
        ) AS churned_users,
        -- Usuarios Activos (Con actividad en ese mes)
        (
            SELECT COUNT(DISTINCT user_id) 
            FROM credits_log cl 
            WHERE TO_CHAR(cl.log_date, 'YYYY-MM') = TO_CHAR(dates.d, 'YYYY-MM')
        ) AS active_users
    FROM
        GENERATE_SERIES(NOW() - INTERVAL '11 months', NOW(), '1 month') AS dates(d)
    LEFT JOIN credit_purchases cp ON TO_CHAR(cp.purchase_date, 'YYYY-MM') = TO_CHAR(dates.d, 'YYYY-MM')
    LEFT JOIN users u ON TO_CHAR(u.created_at, 'YYYY-MM') = TO_CHAR(dates.d, 'YYYY-MM')
    GROUP BY dates.d
    ORDER BY dates.d ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para Ranking de Usuarios (Top 10)
CREATE OR REPLACE FUNCTION fn_report_top_users()
RETURNS TABLE (
    user_id INT,
    user_name VARCHAR,
    score NUMERIC,
    exchanges_count BIGINT,
    credits_generated NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        -- Score calculado: (Intercambios * 10) + (Creditos Generados * 0.5)
        (COUNT(e.id) * 10 + COALESCE(SUM(e.credits_total), 0) * 0.5) AS score,
        COUNT(e.id) AS exchanges_count,
        COALESCE(SUM(e.credits_total), 0) AS credits_generated
    FROM users u
    LEFT JOIN exchanges e ON u.id = e.seller_id OR u.id = e.buyer_id
    GROUP BY u.id, u.name
    ORDER BY score DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
