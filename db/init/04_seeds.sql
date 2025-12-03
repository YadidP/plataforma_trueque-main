-- LIMPIEZA INICIAL (Para evitar duplicados o errores al reiniciar)
TRUNCATE TABLE exchange_impacts CASCADE;
TRUNCATE TABLE exchanges CASCADE;
TRUNCATE TABLE listings CASCADE;
TRUNCATE TABLE impact_equivalences CASCADE;
TRUNCATE TABLE impact_metrics CASCADE;
TRUNCATE TABLE materials CASCADE;
TRUNCATE TABLE subcategories CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE users CASCADE;

-- 1. MATERIALES
INSERT INTO materials (name) VALUES 
('Madera'), ('Algodón'), ('Plástico'), ('Papel'), ('Metal'), ('Vidrio'), ('Electrónicos'), ('Textil Sintético');

-- 2. MÉTRICAS
INSERT INTO impact_metrics (code, name, unit) VALUES
('CO2', 'Huella de Carbono', 'kg'),
('WATER', 'Agua Ahorrada', 'litros'),
('ENERGY', 'Energía Ahorrada', 'kWh'),
('WASTE', 'Residuos Evitados', 'kg'),
('TREES', 'Árboles Equivalentes', 'árboles'),
('RECYCLED', 'Material Reciclado', 'kg');

-- 3. EQUIVALENCIAS (Crucial: base_unit debe coincidir con unit_label de las publicaciones)

-- Madera (base: kg)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name='Madera'), (SELECT id FROM impact_metrics WHERE code='CO2'), 1, 'kg', 1.5),
((SELECT id FROM materials WHERE name='Madera'), (SELECT id FROM impact_metrics WHERE code='TREES'), 100, 'kg', 1),
((SELECT id FROM materials WHERE name='Madera'), (SELECT id FROM impact_metrics WHERE code='ENERGY'), 1, 'kg', 5);

-- Algodón (base: unidades - ej: 1 camiseta)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name='Algodón'), (SELECT id FROM impact_metrics WHERE code='CO2'), 1, 'unidades', 5.5),
((SELECT id FROM materials WHERE name='Algodón'), (SELECT id FROM impact_metrics WHERE code='WATER'), 1, 'unidades', 2700),
((SELECT id FROM materials WHERE name='Algodón'), (SELECT id FROM impact_metrics WHERE code='ENERGY'), 1, 'unidades', 10),
((SELECT id FROM materials WHERE name='Algodón'), (SELECT id FROM impact_metrics WHERE code='WASTE'), 1, 'unidades', 0.2);

-- Plástico (base: kg)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name='Plástico'), (SELECT id FROM impact_metrics WHERE code='CO2'), 1, 'kg', 2.0),
((SELECT id FROM materials WHERE name='Plástico'), (SELECT id FROM impact_metrics WHERE code='ENERGY'), 1, 'kg', 15),
((SELECT id FROM materials WHERE name='Plástico'), (SELECT id FROM impact_metrics WHERE code='RECYCLED'), 1, 'kg', 1);

-- Papel (base: unidades - ej: 1 libro, 100g)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name='Papel'), (SELECT id FROM impact_metrics WHERE code='CO2'), 1, 'unidades', 1.2), -- CO2 por libro
((SELECT id FROM materials WHERE name='Papel'), (SELECT id FROM impact_metrics WHERE code='WATER'), 1, 'unidades', 30), -- Agua por libro
((SELECT id FROM materials WHERE name='Papel'), (SELECT id FROM impact_metrics WHERE code='TREES'), 50, 'unidades', 1); -- 1 árbol por 50 libros

-- Metal (base: kg)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name='Metal'), (SELECT id FROM impact_metrics WHERE code='CO2'), 1, 'kg', 3.0),
((SELECT id FROM materials WHERE name='Metal'), (SELECT id FROM impact_metrics WHERE code='ENERGY'), 1, 'kg', 20),
((SELECT id FROM materials WHERE name='Metal'), (SELECT id FROM impact_metrics WHERE code='RECYCLED'), 1, 'kg', 1);

-- Vidrio (base: unidades - ej: 1 botella)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name='Vidrio'), (SELECT id FROM impact_metrics WHERE code='CO2'), 1, 'unidades', 0.8),
((SELECT id FROM materials WHERE name='Vidrio'), (SELECT id FROM impact_metrics WHERE code='ENERGY'), 1, 'unidades', 3);

-- Electrónicos (base: unidades - ej: 1 smartphone)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name='Electrónicos'), (SELECT id FROM impact_metrics WHERE code='CO2'), 1, 'unidades', 15.0),
((SELECT id FROM materials WHERE name='Electrónicos'), (SELECT id FROM impact_metrics WHERE code='WASTE'), 1, 'unidades', 0.5),
((SELECT id FROM materials WHERE name='Electrónicos'), (SELECT id FROM impact_metrics WHERE code='ENERGY'), 1, 'unidades', 50);

-- Textil Sintético (base: unidades - ej: 1 prenda)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name='Textil Sintético'), (SELECT id FROM impact_metrics WHERE code='CO2'), 1, 'unidades', 7.0),
((SELECT id FROM materials WHERE name='Textil Sintético'), (SELECT id FROM impact_metrics WHERE code='WATER'), 1, 'unidades', 1500),
((SELECT id FROM materials WHERE name='Textil Sintético'), (SELECT id FROM impact_metrics WHERE code='WASTE'), 1, 'unidades', 0.3);


-- 4. CATEGORÍAS Y SUBCATEGORÍAS
INSERT INTO categories (name) VALUES 
('Ropa'), 
('Hogar'), 
('Libros'),
('Electrónica'),
('Servicios');

-- Ropa
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name='Ropa'), 'Camisetas'),
((SELECT id FROM categories WHERE name='Ropa'), 'Pantalones'),
((SELECT id FROM categories WHERE name='Ropa'), 'Abrigos'),
((SELECT id FROM categories WHERE name='Ropa'), 'Zapatos');

-- Hogar
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name='Hogar'), 'Muebles'),
((SELECT id FROM categories WHERE name='Hogar'), 'Decoración'),
((SELECT id FROM categories WHERE name='Hogar'), 'Electrodomésticos'),
((SELECT id FROM categories WHERE name='Hogar'), 'Utensilios de Cocina');

-- Libros
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name='Libros'), 'Novelas'),
((SELECT id FROM categories WHERE name='Libros'), 'Libros de Texto'),
((SELECT id FROM categories WHERE name='Libros'), 'Revistas');

-- Electrónica
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name='Electrónica'), 'Smartphones'),
((SELECT id FROM categories WHERE name='Electrónica'), 'Laptops'),
((SELECT id FROM categories WHERE name='Electrónica'), 'Tablets'),
((SELECT id FROM categories WHERE name='Electrónica'), 'Componentes PC');

-- Servicios (no tienen material_id directo para impacto ambiental en este contexto)
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name='Servicios'), 'Clases Particulares'),
((SELECT id FROM categories WHERE name='Servicios'), 'Reparaciones');

-- 5. USUARIOS
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@ecotrade.com', '$2b$10$2W5loDxWqC4dC4tvNXNI4u.X/ytDg4jl0D43U07MkBeXmXjsu2hpG', 'admin'),
('Ana', 'ana@email.com', '$2b$10$2W5loDxWqC4dC4tvNXNI4u.X/ytDg4jl0D43U07MkBeXmXjsu2hpG', 'usuario'),
('Carlos', 'carlos@email.com', '$2b$10$2W5loDxWqC4dC4tvNXNI4u.X/ytDg4jl0D43U07MkBeXmXjsu2hpG', 'usuario'),
('Maria', 'maria@email.com', '$2b$10$2W5loDxWqC4dC4tvNXNI4u.X/ytDg4jl0D43U07MkBeXmXjsu2hpG', 'usuario');


-- 6. PUBLICACIONES (Asegurando que material y unidad coincidan con equivalencias)

-- Sillas (Madera, kg) - Hogar
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='ana@email.com'), 'Sillas de Roble', 'Juego de 4 sillas de roble macizo, restauradas.', 
 (SELECT id FROM categories WHERE name='Hogar'), (SELECT id FROM subcategories WHERE name='Muebles'),
 (SELECT id FROM materials WHERE name='Madera'), 
 20, -- 20 kg de madera aprox
 50, 'kg', '/uploads/sillas.jpg', 'activa');

-- Camisetas (Algodón, unidades) - Ropa
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='ana@email.com'), 'Camiseta Vintage', 'Algodón 100% orgánico, talla M, buen estado.', 
 (SELECT id FROM categories WHERE name='Ropa'), (SELECT id FROM subcategories WHERE name='Camisetas'),
 (SELECT id FROM materials WHERE name='Algodón'), 
 3, -- 3 unidades
 15, 'unidades', '/uploads/ropa.jpg', 'activa');

-- Smartphone Usado (Electrónicos, unidades) - Electrónica
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='carlos@email.com'), 'Smartphone Android Usado', 'Modelo X, funcionando perfectamente, incluye cargador.', 
 (SELECT id FROM categories WHERE name='Electrónica'), (SELECT id FROM subcategories WHERE name='Smartphones'),
 (SELECT id FROM materials WHERE name='Electrónicos'), 
 1, -- 1 unidad
 100, 'unidades', '/uploads/smartphone.jpg', 'activa');

-- Libros de Novela (Papel, unidades) - Libros
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='carlos@email.com'), 'Colección de Novelas Fantásticas', '5 libros de tapa dura en excelente estado.', 
 (SELECT id FROM categories WHERE name='Libros'), (SELECT id FROM subcategories WHERE name='Novelas'),
 (SELECT id FROM materials WHERE name='Papel'), 
 5, -- 5 unidades
 25, 'unidades', '/uploads/novelas.jpg', 'activa');

-- Botellas de Vidrio (Vidrio, unidades) - Hogar (Utensilios)
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='maria@email.com'), 'Set de Botellas de Vidrio', '6 botellas de 1L con tapa, ideal para bebidas caseras.', 
 (SELECT id FROM categories WHERE name='Hogar'), (SELECT id FROM subcategories WHERE name='Utensilios de Cocina'),
 (SELECT id FROM materials WHERE name='Vidrio'), 
 6, -- 6 unidades
 10, 'unidades', '/uploads/botellas.jpg', 'activa');

-- Chaqueta Impermeable (Textil Sintético, unidades) - Ropa
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='maria@email.com'), 'Chaqueta Impermeable Talla L', 'Poliéster reciclado, perfecta para la lluvia.', 
 (SELECT id FROM categories WHERE name='Ropa'), (SELECT id FROM subcategories WHERE name='Abrigos'),
 (SELECT id FROM materials WHERE name='Textil Sintético'), 
 1, -- 1 unidad
 40, 'unidades', '/uploads/chaqueta.jpg', 'activa');

-- Mesa Auxiliar (Metal, kg) - Hogar (Muebles)
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='ana@email.com'), 'Mesa Auxiliar de Metal', 'Pequeña mesa de centro de metal forjado.', 
 (SELECT id FROM categories WHERE name='Hogar'), (SELECT id FROM subcategories WHERE name='Muebles'),
 (SELECT id FROM materials WHERE name='Metal'), 
 5, -- 5 kg
 30, 'kg', '/uploads/mesa_metal.jpg', 'activa');

-- Juguetes de Plástico (Plástico, kg) - Hogar (Decoración, si no hay otra)
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='carlos@email.com'), 'Lote de Juguetes Infantiles', 'Juguetes variados de plástico duro, buen estado.', 
 (SELECT id FROM categories WHERE name='Hogar'), (SELECT id FROM subcategories WHERE name='Decoración'), -- Asumiendo que pueden ir en decoración
 (SELECT id FROM materials WHERE name='Plástico'), 
 3, -- 3 kg
 20, 'kg', '/uploads/juguetes_plastico.jpg', 'activa');

-- Reparación de Bicicletas (Servicios, unidades - sin material id)
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='maria@email.com'), 'Servicio de Reparación de Bicicletas', 'Ajuste de frenos y cambios, engrase y revisión general.', 
 (SELECT id FROM categories WHERE name='Servicios'), (SELECT id FROM subcategories WHERE name='Reparaciones'),
 NULL, -- No material_id para servicios
 1, -- 1 servicio
 60, 'unidades', '/uploads/reparacion_bici.jpg', 'activa');

-- Libro de Texto (Papel, unidades) - Libros
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='ana@email.com'), 'Libro de Álgebra Lineal', 'Edición actualizada, buen estado, ideal para estudiantes.', 
 (SELECT id FROM categories WHERE name='Libros'), (SELECT id FROM subcategories WHERE name='Libros de Texto'),
 (SELECT id FROM materials WHERE name='Papel'), 
 1, -- 1 unidad
 30, 'unidades', '/uploads/libro_algebra.jpg', 'activa');

-- PLANES DE SUSCRIPCIÓN (Con prioridades)
INSERT INTO subscriptions (name, price_bs, duration_days, priority, description) VALUES
('Gratuito', 0, 3650, 0, 'Plan básico.'),
('Plan Eco-Pro', 80.00, 30, 1, 'Visibilidad media. Soporte prioritario.'),
('Plan Eco-Leader', 150.00, 30, 2, 'Máxima visibilidad (Top). Insignia de Líder.')
ON CONFLICT (name) DO NOTHING;

-- Asignar suscripción gratuita a usuarios existentes si no tienen
-- Asumimos que el "Gratuito" es un plan interno con ID 1, si no existe, lo crea
INSERT INTO subscriptions (name, price_bs, duration_days, description) VALUES
('Gratuito', 0, 3650, 'Plan básico para todos los usuarios.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_subscriptions (user_id, subscription_id, start_date, end_date, is_active)
SELECT u.id, s.id, NOW(), NOW() + INTERVAL '10 years', TRUE
FROM users u, subscriptions s
WHERE s.name='Gratuito' AND u.id NOT IN (SELECT user_id FROM user_subscriptions WHERE is_active = true AND end_date > NOW());
-- ... (después de insertar los intercambios o al final del archivo)

-- 7. GENERAR INTERCAMBIOS DE PRUEBA Y SU IMPACTO
-- (Esto es necesario para que el Dashboard Admin Módulo 4 no salga vacío)

DO $$
DECLARE
    v_ana_id INT := (SELECT id FROM users WHERE email = 'ana@email.com');
    v_carlos_id INT := (SELECT id FROM users WHERE email = 'carlos@email.com');
    v_listing_id INT;
    v_exchange_id BIGINT;
    v_material_id INT;
BEGIN
    -- Intercambio 1: Carlos compra Sillas (Madera) a Ana
    SELECT id, material_id INTO v_listing_id, v_material_id FROM listings WHERE title = 'Sillas de Roble';
    
    IF NOT EXISTS (SELECT 1 FROM exchanges WHERE listing_id = v_listing_id) THEN
        INSERT INTO exchanges (listing_id, buyer_id, seller_id, quantity, credits_per_unit, credits_total, exchange_date)
        VALUES (v_listing_id, v_carlos_id, v_ana_id, 4, 50, 200, NOW() - INTERVAL '5 days')
        RETURNING id INTO v_exchange_id;

        -- Insertar Impacto (Madera: CO2, Arboles)
        INSERT INTO exchange_impacts (exchange_id, metric_code, metric_name, metric_unit, impact_value) VALUES
        (v_exchange_id, 'CO2', 'Huella de Carbono', 'kg', 4 * 1.5),
        (v_exchange_id, 'TREES', 'Árboles Equivalentes', 'árboles', (4 / 100.0) * 1);
    END IF;

    -- Intercambio 2: Ana compra Smartphone (Electrónicos) a Carlos
    SELECT id, material_id INTO v_listing_id, v_material_id FROM listings WHERE title = 'Smartphone Android Usado';
    
    IF NOT EXISTS (SELECT 1 FROM exchanges WHERE listing_id = v_listing_id) THEN
        INSERT INTO exchanges (listing_id, buyer_id, seller_id, quantity, credits_per_unit, credits_total, exchange_date)
        VALUES (v_listing_id, v_ana_id, v_carlos_id, 1, 100, 100, NOW() - INTERVAL '10 days')
        RETURNING id INTO v_exchange_id;

        -- Insertar Impacto (Electrónicos: CO2, Waste, Energy)
        INSERT INTO exchange_impacts (exchange_id, metric_code, metric_name, metric_unit, impact_value) VALUES
        (v_exchange_id, 'CO2', 'Huella de Carbono', 'kg', 1 * 50.0),
        (v_exchange_id, 'WASTE', 'Residuos Evitados', 'kg', 1 * 0.5),
        (v_exchange_id, 'ENERGY', 'Energía Ahorrada', 'kWh', 1 * 50);
    END IF;
END $$;

-- 8. DATOS PARA CAMPAÑAS DE EMPRENDEDOR

-- Crear usuario Emprendedor
INSERT INTO users (name, email, password_hash, role, bio) VALUES
('Tienda EcoTech', 'tienda@ecotech.com', '$2b$10$2W5loDxWqC4dC4tvNXNI4u.X/ytDg4jl0D43U07MkBeXmXjsu2hpG', 'emprendedor', 'Somos especialistas en reacondicionados.')
ON CONFLICT (email) DO NOTHING;

-- Crear Perfil
INSERT INTO entrepreneur_profiles (user_id, business_name, validation_status) 
VALUES ((SELECT id FROM users WHERE email='tienda@ecotech.com'), 'EcoTech Solutions', 'validado')
ON CONFLICT (user_id) DO NOTHING;

-- Crear stock para el emprendedor
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='tienda@ecotech.com'), 'Tablet Reacondicionada X', 'Tablet de 10 pulgadas, batería nueva.', 
 (SELECT id FROM categories WHERE name='Electrónica'), (SELECT id FROM subcategories WHERE name='Tablets'),
 (SELECT id FROM materials WHERE name='Electrónicos'), 10, 800, 'unidades', '/uploads/tablet.jpg', 'activa')
ON CONFLICT (title, author_id) DO NOTHING;
 
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, material_id, quantity, unit_credits, unit_label, image_url, status) VALUES
((SELECT id FROM users WHERE email='tienda@ecotech.com'), 'Funda Tablet Universal', 'Funda de neopreno reciclado.', 
 (SELECT id FROM categories WHERE name='Electrónica'), (SELECT id FROM subcategories WHERE name='Tablets'),
 (SELECT id FROM materials WHERE name='Textil Sintético'), 20, 50, 'unidades', '/uploads/funda.jpg', 'activa')
ON CONFLICT (title, author_id) DO NOTHING;

-- CAMPAÑA 1: Descuento del 20% en Tablets (Navidad Tech)
INSERT INTO campaigns (entrepreneur_id, name, type, start_date, end_date, config)
VALUES (
    (SELECT id FROM users WHERE email='tienda@ecotech.com'),
    'Navidad Tech',
    'discount',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    '{"discount_percent": 20}'
)
ON CONFLICT (entrepreneur_id, name) DO NOTHING;

-- Asociar la Tablet a la campaña
INSERT INTO campaign_items (campaign_id, listing_id, role)
SELECT 
    (SELECT id FROM campaigns WHERE name='Navidad Tech' AND entrepreneur_id = (SELECT id FROM users WHERE email='tienda@ecotech.com')),
    (SELECT id FROM listings WHERE title='Tablet Reacondicionada X' AND author_id = (SELECT id FROM users WHERE email='tienda@ecotech.com')),
    'target'
ON CONFLICT (campaign_id, listing_id) DO NOTHING;

-- CAMPAÑA 2: Regalo (Compra > 700 créditos y lleva Funda gratis)
INSERT INTO campaigns (entrepreneur_id, name, type, start_date, end_date, config)
VALUES (
    (SELECT id FROM users WHERE email='tienda@ecotech.com'),
    'Protege tu Tech',
    'gift',
    NOW() - INTERVAL '1 day',
    NOW() + INTERVAL '30 days',
    '{"min_amount": 700}'
)
ON CONFLICT (entrepreneur_id, name) DO NOTHING;

-- Asociar la Funda como REGALO
INSERT INTO campaign_items (campaign_id, listing_id, role)
SELECT 
    (SELECT id FROM campaigns WHERE name='Protege tu Tech' AND entrepreneur_id = (SELECT id FROM users WHERE email='tienda@ecotech.com')),
    (SELECT id FROM listings WHERE title='Funda Tablet Universal' AND author_id = (SELECT id FROM users WHERE email='tienda@ecotech.com')),
    'reward'
ON CONFLICT (campaign_id, listing_id) DO NOTHING;