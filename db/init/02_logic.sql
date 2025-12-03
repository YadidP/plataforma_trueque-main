-- db/init/02_logic.sql

-- Contenido de 02_functions_and_procedures.sql
-- Helper: asegurar billetera (si no existe, crearla en 0)
CREATE OR REPLACE FUNCTION ensure_wallet(p_user_id INT) RETURNS VOID AS $$
BEGIN
  INSERT INTO wallets (user_id, balance) VALUES (p_user_id, 0.00)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Helper: obtener saldo (FOR UPDATE opcional)
CREATE OR REPLACE FUNCTION get_balance_for_update(p_user_id INT) RETURNS NUMERIC AS $$
DECLARE v_balance NUMERIC;
BEGIN
  PERFORM ensure_wallet(p_user_id);
  SELECT balance INTO v_balance FROM wallets WHERE user_id = p_user_id FOR UPDATE;
  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Comprar créditos: registra compra, acredita billetera y log
-- Firma: CALL sp_comprar_creditos(user_id, credits, amount_bs, payment_ref)
CREATE OR REPLACE PROCEDURE sp_comprar_creditos(
  IN p_user_id INT,
  IN p_credits INT,
  IN p_amount_bs NUMERIC,
  IN p_payment_ref TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_balance NUMERIC;
  v_new_balance NUMERIC;
  v_purchase_id BIGINT;
BEGIN
  IF p_credits <= 0 OR p_amount_bs < 0 THEN
    RAISE EXCEPTION 'Parámetros inválidos en compra de créditos';
  END IF;

  -- Creamos billetera si no existe y bloqueamos fila
  v_balance := get_balance_for_update(p_user_id);

  INSERT INTO credit_purchases (user_id, credits, amount_bs, status, payment_ref)
  VALUES (p_user_id, p_credits, p_amount_bs, 'pagado', p_payment_ref)
  RETURNING id INTO v_purchase_id;

  -- Actualizar saldo
  UPDATE wallets
     SET balance = balance + p_credits,
         last_updated = now()
   WHERE user_id = p_user_id
   RETURNING balance INTO v_new_balance;

  -- Log
  INSERT INTO credits_log (user_id, operation_type, delta, balance_after, related_id)
  VALUES (
    p_user_id,
    'compra_creditos',
    p_credits,
    v_new_balance,
    v_purchase_id
  );

END;
$$;

ALTER TABLE exchanges ADD COLUMN status VARCHAR(20) DEFAULT 'completado'; 
ALTER TABLE exchanges ADD CONSTRAINT chk_exchange_status CHECK (status IN ('pendiente', 'completado', 'cancelado'));

CREATE OR REPLACE PROCEDURE sp_registrar_intercambio(
  IN p_buyer_id INT,
  IN p_listing_id INT,
  IN p_quantity INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_unit NUMERIC;
  v_total NUMERIC;
  v_seller_id INT;
  v_status TEXT;
  v_balance NUMERIC;
  v_exchange_id BIGINT;
  v_material_id INT;
  v_unit_label VARCHAR(50);
BEGIN
  -- Validaciones iniciales (igual que antes)
  IF p_quantity <= 0 THEN RAISE EXCEPTION 'Cantidad inválida'; END IF;

  SELECT author_id, unit_credits, status, material_id, unit_label
    INTO v_seller_id, v_unit, v_status, v_material_id, v_unit_label
  FROM listings WHERE id = p_listing_id FOR UPDATE;

  IF v_seller_id IS NULL THEN RAISE EXCEPTION 'Publicación inexistente'; END IF;
  IF v_status <> 'activa' THEN RAISE EXCEPTION 'La publicación no está activa'; END IF;
  IF v_seller_id = p_buyer_id THEN RAISE EXCEPTION 'El comprador no puede comprar su propia publicación'; END IF;

  v_total := v_unit * p_quantity;

  -- 1. DEBITAR AL COMPRADOR (Créditos retenidos por el sistema)
  SELECT balance INTO v_balance FROM wallets WHERE user_id = p_buyer_id FOR UPDATE;
  IF v_balance < v_total THEN RAISE EXCEPTION 'Saldo insuficiente'; END IF;
  
  UPDATE wallets SET balance = balance - v_total WHERE user_id = p_buyer_id RETURNING balance INTO v_balance;
  
  INSERT INTO credits_log (user_id, operation_type, delta, balance_after, related_id)
  VALUES (p_buyer_id, 'intercambio_retenido', -v_total, v_balance, p_listing_id);

  -- 2. NO ACREDITAR AL VENDEDOR AÚN (Se hará en la confirmación)

  -- 3. REGISTRAR INTERCAMBIO CON ESTADO 'pendiente'
  INSERT INTO exchanges (listing_id, buyer_id, seller_id, quantity, credits_per_unit, credits_total, status)
  VALUES (p_listing_id, p_buyer_id, v_seller_id, p_quantity, v_unit, v_total, 'pendiente')
  RETURNING id INTO v_exchange_id;

  -- 4. Registrar impacto ambiental (igual que antes)
  IF v_material_id IS NOT NULL AND v_unit_label IS NOT NULL THEN
    INSERT INTO exchange_impacts (exchange_id, metric_code, metric_name, metric_unit, impact_value)
    SELECT v_exchange_id, im.code, im.name, im.unit, (p_quantity / ie.base_quantity) * ie.impact_value
    FROM impact_equivalences ie JOIN impact_metrics im ON ie.metric_id = im.id
    WHERE ie.material_id = v_material_id AND ie.base_unit = v_unit_label;
  END IF;

  -- 5. Marcar publicación como reservada/intercambiada
  UPDATE listings SET status = 'intercambiada' WHERE id = p_listing_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_confirmar_intercambio(
  IN p_exchange_id BIGINT,
  IN p_user_id INT -- El usuario que confirma (comprador)
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_seller_id INT;
  v_buyer_id INT;
  v_total NUMERIC;
  v_status VARCHAR;
  v_balance NUMERIC;
BEGIN
  SELECT seller_id, buyer_id, credits_total, status 
  INTO v_seller_id, v_buyer_id, v_total, v_status
  FROM exchanges WHERE id = p_exchange_id FOR UPDATE;

  -- Validaciones
  IF v_status <> 'pendiente' THEN RAISE EXCEPTION 'El intercambio no está pendiente'; END IF;
  
  -- Permitir que el sistema (user_id 0 o NULL) o el comprador confirmen
  IF p_user_id IS NOT NULL AND v_buyer_id <> p_user_id THEN 
     RAISE EXCEPTION 'Solo el comprador puede confirmar la recepción'; 
  END IF;

  -- 1. ACREDITAR AL VENDEDOR
  PERFORM ensure_wallet(v_seller_id);
  UPDATE wallets SET balance = balance + v_total WHERE user_id = v_seller_id RETURNING balance INTO v_balance;
  
  INSERT INTO credits_log (user_id, operation_type, delta, balance_after, related_id)
  VALUES (v_seller_id, 'intercambio_completado', v_total, v_balance, p_exchange_id);

  -- 2. ACTUALIZAR ESTADO
  UPDATE exchanges SET status = 'completado' WHERE id = p_exchange_id;
END;
$$;

CREATE OR REPLACE PROCEDURE sp_cancelar_intercambio(
  IN p_exchange_id BIGINT,
  IN p_user_id INT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_buyer_id INT;
  v_listing_id INT;
  v_total NUMERIC;
  v_status VARCHAR;
  v_balance NUMERIC;
BEGIN
  SELECT buyer_id, listing_id, credits_total, status 
  INTO v_buyer_id, v_listing_id, v_total, v_status
  FROM exchanges WHERE id = p_exchange_id FOR UPDATE;

  IF v_status <> 'pendiente' THEN RAISE EXCEPTION 'El intercambio no está pendiente'; END IF;
  IF v_buyer_id <> p_user_id THEN RAISE EXCEPTION 'Solo el comprador puede cancelar'; END IF;

  -- 1. REEMBOLSAR AL COMPRADOR
  UPDATE wallets SET balance = balance + v_total WHERE user_id = v_buyer_id RETURNING balance INTO v_balance;
  
  INSERT INTO credits_log (user_id, operation_type, delta, balance_after, related_id)
  VALUES (v_buyer_id, 'intercambio_reembolso', v_total, v_balance, p_exchange_id);

  -- 2. REACTIVAR PUBLICACIÓN
  UPDATE listings SET status = 'activa' WHERE id = v_listing_id;

  -- 3. MARCAR COMO CANCELADO
  UPDATE exchanges SET status = 'cancelado' WHERE id = p_exchange_id;
END;
$$;

-- Función para el Reporte de Usuarios (parametrizada)
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

-- Función para el Reporte de Monetización (parametrizada)
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

-- Función para el Reporte de Impacto (parametrizada)
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

-- Función para el Reporte de Reclamos (parametrizada)
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


-- Contenido de 05_views.sql
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


-- Contenido de 07_advanced_reports.sql
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


-- Contenido de 08_fix_reports.sql
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
