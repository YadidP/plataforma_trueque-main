-- db/init/05_views.sql

-- VISTA PARA REPORTES DE USUARIOS
CREATE OR REPLACE VIEW view_user_reports AS
SELECT
    u.id AS user_id,
    u.name,
    u.email,
    u.role,
    u.created_at,
    w.balance,
    (
        SELECT MAX(log_date)
        FROM credits_log
        WHERE user_id = u.id
    ) AS last_activity_date,
    (
        SELECT COUNT(*)
        FROM listings
        WHERE author_id = u.id
    ) AS total_listings,
    (
        SELECT COUNT(*)
        FROM exchanges
        WHERE seller_id = u.id OR buyer_id = u.id
    ) AS total_exchanges,
    -- Define "activo" si tuvo actividad en los últimos 30 días
    (
        SELECT MAX(log_date) > (NOW() - INTERVAL '30 days')
        FROM credits_log
        WHERE user_id = u.id
    ) AS is_active_last_30_days,
    -- Define "abandono" (churn) si no tuvo actividad en los últimos 60 días
    (
        SELECT MAX(log_date) < (NOW() - INTERVAL '60 days')
        FROM credits_log
        WHERE user_id = u.id
    ) AS is_churn_last_60_days
FROM
    users u
LEFT JOIN
    wallets w ON u.id = w.user_id;


-- VISTA PARA REPORTES DE MONETIZACIÓN
CREATE OR REPLACE VIEW view_monetization_reports AS
SELECT
    -- Ingresos por venta de créditos
    (SELECT COALESCE(SUM(amount_bs), 0) FROM credit_purchases) AS total_revenue_credit_sales,
    (SELECT COALESCE(SUM(amount_bs), 0) FROM credit_purchases WHERE purchase_date >= NOW() - INTERVAL '30 days') AS revenue_credit_sales_last_30_days,
    
    -- Ingresos por suscripciones (asumiendo que las tenemos)
    (SELECT COALESCE(SUM(s.price_bs), 0) FROM user_subscriptions us JOIN subscriptions s ON us.subscription_id = s.id) AS total_revenue_subscriptions,
    (SELECT COALESCE(SUM(s.price_bs), 0) FROM user_subscriptions us JOIN subscriptions s ON us.subscription_id = s.id WHERE us.start_date >= NOW() - INTERVAL '30 days') AS revenue_subscriptions_last_30_days,

    -- Generación de créditos
    (SELECT COALESCE(SUM(credits), 0) FROM credit_purchases) AS credits_from_purchase,
    (SELECT COALESCE(SUM(delta), 0) FROM credits_log WHERE operation_type = 'intercambio_credito') AS credits_from_exchanges,
    (SELECT COALESCE(SUM(delta), 0) FROM credits_log WHERE operation_type = 'incentivo_publicacion') AS credits_from_incentives,
    (SELECT COALESCE(SUM(delta), 0) FROM credits_log WHERE operation_type = 'bono_bienvenida') AS credits_from_welcome_bonus,

    -- Consumo de créditos
    (SELECT ABS(COALESCE(SUM(delta), 0)) FROM credits_log WHERE operation_type = 'intercambio_debito') AS credits_consumed_in_exchanges,
    
    -- Adopción de suscripción premium
    (SELECT COUNT(*) FROM user_subscriptions WHERE is_active = TRUE) AS active_premium_users;


-- VISTA PARA REPORTES DE IMPACTO AMBIENTAL
CREATE OR REPLACE VIEW view_impact_reports AS
SELECT 
    c.id AS category_id,
    c.name AS category_name,
    COUNT(DISTINCT l.id) AS total_listings,
    COUNT(DISTINCT e.id) AS total_exchanges,
    COALESCE(SUM(e.quantity), 0) AS total_items_exchanged,
    -- Ratio de publicación vs intercambio por categoría
    CASE 
        WHEN COUNT(DISTINCT l.id) > 0 THEN (COUNT(DISTINCT e.id)::NUMERIC / COUNT(DISTINCT l.id)::NUMERIC)
        ELSE 0 
    END AS listing_to_exchange_ratio
FROM categories c
LEFT JOIN listings l ON c.id = l.category_id
LEFT JOIN exchanges e ON l.id = e.listing_id
GROUP BY c.id, c.name;