-- db/init/04_seeds.sql (VERSIÓN CORREGIDA Y MEJORADA)
-- Se usan los procedimientos almacenados para garantizar la integridad de los datos.

-- Insertar Categorías, Subcategorías, Materiales y Métricas (sin cambios)
INSERT INTO categories (name) VALUES
('Electrónica'), ('Ropa y Accesorios'), ('Libros y Papelería'), ('Hogar y Decoración'),
('Deportes y Ocio'), ('Juguetes y Niños'), ('Herramientas y Bricolaje'),
('Salud y Belleza'), ('Alimentos y Bebidas'), ('Servicios')
ON CONFLICT (name) DO NOTHING;

INSERT INTO subcategories (category_id, name) VALUES
-- Electrónica
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Smartphones'),
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Laptops'),
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Audio y Video'),
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Accesorios'),
-- Ropa y Accesorios
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Camisetas'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Pantalones'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Calzado'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Bolsos y Carteras'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Joyas'),
-- Libros y Papelería
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Novelas'),
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Texto'),
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Material Escolar'),
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Arte y Manualidades'),
-- Hogar y Decoración
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Muebles'),
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Decoración'),
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Cocina y Comedor'),
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Jardinería'),
-- Deportes y Ocio
((SELECT id FROM categories WHERE name = 'Deportes y Ocio'), 'Bicicletas'),
((SELECT id FROM categories WHERE name = 'Deportes y Ocio'), 'Equipo de Camping'),
((SELECT id FROM categories WHERE name = 'Deportes y Ocio'), 'Balones y Pelotas'),
((SELECT id FROM categories WHERE name = 'Deportes y Ocio'), 'Juegos de Mesa'),
-- Juguetes y Niños
((SELECT id FROM categories WHERE name = 'Juguetes y Niños'), 'Figuras de Acción'),
((SELECT id FROM categories WHERE name = 'Juguetes y Niños'), 'Muñecas y Accesorios'),
((SELECT id FROM categories WHERE name = 'Juguetes y Niños'), 'Juguetes Educativos'),
((SELECT id FROM categories WHERE name = 'Juguetes y Niños'), 'Ropa Infantil'),
-- Herramientas y Bricolaje
((SELECT id FROM categories WHERE name = 'Herramientas y Bricolaje'), 'Herramientas Manuales'),
((SELECT id FROM categories WHERE name = 'Herramientas y Bricolaje'), 'Herramientas Eléctricas'),
((SELECT id FROM categories WHERE name = 'Herramientas y Bricolaje'), 'Materiales de Construcción'),
-- Salud y Belleza
((SELECT id FROM categories WHERE name = 'Salud y Belleza'), 'Maquillaje'),
((SELECT id FROM categories WHERE name = 'Salud y Belleza'), 'Cuidado de la Piel'),
((SELECT id FROM categories WHERE name = 'Salud y Belleza'), 'Perfumes'),
((SELECT id FROM categories WHERE name = 'Salud y Belleza'), 'Cuidado del Cabello'),
-- Alimentos y Bebidas
((SELECT id FROM categories WHERE name = 'Alimentos y Bebidas'), 'Productos No Perecederos'),
((SELECT id FROM categories WHERE name = 'Alimentos y Bebidas'), 'Bebidas Artesanales'),
((SELECT id FROM categories WHERE name = 'Alimentos y Bebidas'), 'Conservas'),
-- Servicios
((SELECT id FROM categories WHERE name = 'Servicios'), 'Clases Particulares'),
((SELECT id FROM categories WHERE name = 'Servicios'), 'Reparaciones'),
((SELECT id FROM categories WHERE name = 'Servicios'), 'Asesoría y Consultoría'),
((SELECT id FROM categories WHERE name = 'Servicios'), 'Cuidado de Mascotas')
ON CONFLICT (category_id, name) DO NOTHING;

INSERT INTO materials (name) VALUES ('Plástico'), ('Metal'), ('Madera'), ('Tela (Algodón)'), ('Vidrio'), ('Papel') ON CONFLICT (name) DO NOTHING;
INSERT INTO impact_metrics (code, name, unit) VALUES ('CO2', 'Dióxido de Carbono', 'kg'), ('WATER', 'Agua', 'L'), ('ENERGY', 'Energía', 'kWh') ON CONFLICT (code) DO NOTHING;
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name = 'Plástico'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 3.5),
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 7500),
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 0.9)
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Suscripciones
INSERT INTO subscriptions (name, price_bs, duration_days, description) VALUES
('Premium Mensual', 35.00, 30, 'Visibilidad mejorada.'),
('Premium Trimestral', 90.00, 90, 'Ahorra un 15%.'),
('Premium Anual', 300.00, 365, 'El mejor valor.')
ON CONFLICT (name) DO NOTHING;

-- 1. CREACIÓN DE USUARIOS
-- La creación de usuarios dispara el trigger 'trg_bono_bienvenida' que les otorga 10 créditos iniciales.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@eco.com') THEN
    INSERT INTO users (name, email, password_hash, role, created_at) VALUES
    ('Administrador', 'admin@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'admin', NOW() - INTERVAL '6 months'),
    ('Emprendedor Verde', 'emprendedor@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'emprendedor', NOW() - INTERVAL '5 months'),
    ('Usuario Ana', 'ana@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario', NOW() - INTERVAL '4 months'),
    ('ONG Ambiental', 'ong@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'ong', NOW() - INTERVAL '4 months'),
    ('Carlos Perez', 'carlos@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario', NOW() - INTERVAL '3 months'),
    ('Lucia Mendez', 'lucia@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario', NOW() - INTERVAL '2 months'),
    ('Roberto Gomez', 'roberto@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario', NOW() - INTERVAL '1 month'),
    ('Maria Rodriguez', 'maria@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario', NOW() - INTERVAL '20 days'),
    ('Tienda Eco', 'tienda@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'emprendedor', NOW() - INTERVAL '10 days'),
    ('Nuevo Usuario', 'nuevo@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario', NOW() - INTERVAL '2 days');
  END IF;
END $$;


-- 2. PUBLICACIONES INICIALES
-- La creación de publicaciones dispara 'trg_incentivo_publicacion' (+5 créditos).
-- Balances esperados después de esto: 15 créditos para cada publicador.
DO $$
BEGIN
    -- Publicaciones que estarán activas
    IF NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Sillas de Madera Restauradas') THEN
        INSERT INTO listings (author_id, title, description, category_id, subcategory_id, unit_credits, image_url, created_at, status) VALUES
        ((SELECT id FROM users WHERE email='emprendedor@eco.com'), 'Sillas de Madera Restauradas', 'Set de 4 sillas de comedor, restauradas y barnizadas.', (SELECT id FROM categories WHERE name='Hogar y Decoración'), (SELECT id FROM subcategories WHERE name='Muebles'), 50, '/uploads/sillas.jpg', NOW() - INTERVAL '60 days', 'activa');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Bicicleta de Montaña R26') THEN
        INSERT INTO listings (author_id, title, description, category_id, subcategory_id, unit_credits, image_url, created_at, status) VALUES
        ((SELECT id FROM users WHERE email='carlos@eco.com'), 'Bicicleta de Montaña R26', 'Marca "Vento", 18 velocidades. Le falta un pedal.', (SELECT id FROM categories WHERE name='Deportes y Ocio'), (SELECT id FROM subcategories WHERE name='Muebles'), 120, '/uploads/bici.jpg', NOW() - INTERVAL '25 days', 'activa');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Clases de Matemáticas Online') THEN
        INSERT INTO listings (author_id, title, description, category_id, subcategory_id, unit_credits, image_url, created_at, status) VALUES
        ((SELECT id FROM users WHERE email='roberto@eco.com'), 'Clases de Matemáticas Online', 'Nivel secundaria y preparatoria. 1 hora por Zoom.', (SELECT id FROM categories WHERE name='Servicios'), (SELECT id FROM subcategories WHERE name='Clases Particulares'), 20, '/uploads/clases.jpg', NOW() - INTERVAL '5 days', 'activa');
    END IF;
     IF NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Jabones Artesanales Ecológicos') THEN
        INSERT INTO listings (author_id, title, description, category_id, subcategory_id, unit_credits, image_url, created_at, status) VALUES
        ((SELECT id FROM users WHERE email='tienda@eco.com'), 'Jabones Artesanales Ecológicos', 'Pack de 3 jabones. Lavanda, avena y romero.', (SELECT id FROM categories WHERE name='Salud y Belleza'), (SELECT id FROM subcategories WHERE name='Muebles'), 10, '/uploads/jabones.jpg', NOW() - INTERVAL '3 days', 'activa');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Mesa de Centro de Roble') THEN
        INSERT INTO listings (author_id, title, description, category_id, subcategory_id, unit_credits, image_url, created_at, status) VALUES
        ((SELECT id FROM users WHERE email='emprendedor@eco.com'), 'Mesa de Centro de Roble', 'Madera maciza de roble reciclada. Estilo rústico.', (SELECT id FROM categories WHERE name='Hogar y Decoración'), (SELECT id FROM subcategories WHERE name='Muebles'), 45, '/uploads/mesa.jpg', NOW() - INTERVAL '2 days', 'activa');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Lote Ropa de Bebé (0-6 meses)') THEN
        INSERT INTO listings (author_id, title, description, category_id, subcategory_id, unit_credits, image_url, created_at, status) VALUES
        ((SELECT id FROM users WHERE email='ana@eco.com'), 'Lote Ropa de Bebé (0-6 meses)', 'Ropa en excelente estado, casi nueva.', (SELECT id FROM categories WHERE name='Ropa y Accesorios'), (SELECT id FROM subcategories WHERE name='Camisetas'), 25, '/uploads/ropa.jpg', NOW() - INTERVAL '1 day', 'activa');
    END IF;

    -- Publicaciones que estarán ya intercambiadas
    IF NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Lote de 5 Novelas de Ficción') THEN
        INSERT INTO listings (author_id, title, description, category_id, subcategory_id, unit_credits, image_url, created_at, status) VALUES
        ((SELECT id FROM users WHERE email='ana@eco.com'), 'Lote de 5 Novelas de Ficción', 'Colección de bolsillo. Autores varios.', (SELECT id FROM categories WHERE name='Libros y Papelería'), (SELECT id FROM subcategories WHERE name='Novelas'), 15, '/uploads/libros.jpg', NOW() - INTERVAL '55 days', 'intercambiada');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM listings WHERE title = 'Monitor Gamer 24" Full HD') THEN
        INSERT INTO listings (author_id, title, description, category_id, subcategory_id, unit_credits, image_url, created_at, status) VALUES
        ((SELECT id FROM users WHERE email='lucia@eco.com'), 'Monitor Gamer 24" Full HD', '144Hz, 1ms de respuesta. Funciona perfectamente.', (SELECT id FROM categories WHERE name='Electrónica'), (SELECT id FROM subcategories WHERE name='Laptops'), 80, '/uploads/monitor.jpg', NOW() - INTERVAL '20 days', 'intercambiada');
    END IF;
END $$;


-- 3. COMPRA DE CRÉDITOS (USANDO EL PROCEDIMIENTO ALMACENADO)
-- Esto actualiza 'wallets' y crea un 'credits_log' automáticamente.
DO $$
DECLARE
    v_carlos_id INT := (SELECT id FROM users WHERE email = 'carlos@eco.com');
    v_lucia_id INT := (SELECT id FROM users WHERE email = 'lucia@eco.com');
    v_roberto_id INT := (SELECT id FROM users WHERE email = 'roberto@eco.com');
    v_nuevo_id INT := (SELECT id FROM users WHERE email = 'nuevo@eco.com');
BEGIN
    -- Solo se ejecuta si no hay ya una compra para ese usuario (evita duplicados)
    IF NOT EXISTS (SELECT 1 FROM credit_purchases WHERE user_id = v_carlos_id) THEN
        CALL sp_comprar_creditos(v_carlos_id, 100, 100.00, 'ref_carlos123');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM credit_purchases WHERE user_id = v_lucia_id) THEN
        CALL sp_comprar_creditos(v_lucia_id, 50, 50.00, 'ref_lucia456');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM credit_purchases WHERE user_id = v_roberto_id) THEN
        CALL sp_comprar_creditos(v_roberto_id, 200, 200.00, 'ref_roberto789');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM credit_purchases WHERE user_id = v_nuevo_id) THEN
        CALL sp_comprar_creditos(v_nuevo_id, 20, 20.00, 'ref_nuevo101');
    END IF;
END $$;
-- Balance esperado Roberto: 15 (bono+incentivo) + 200 (compra) = 215

-- 4. INTERCAMBIOS (USANDO EL PROCEDIMIENTO ALMACENADO)
-- Esto debita al comprador, acredita al vendedor, crea el 'exchange' y el 'log'.
DO $$
DECLARE
    v_carlos_id INT := (SELECT id FROM users WHERE email = 'carlos@eco.com');
    v_ana_id INT := (SELECT id FROM users WHERE email = 'ana@eco.com');
    v_roberto_id INT := (SELECT id FROM users WHERE email = 'roberto@eco.com');
    v_lucia_id INT := (SELECT id FROM users WHERE email = 'lucia@eco.com');
    v_listing_libros_id INT := (SELECT id FROM listings WHERE title = 'Lote de 5 Novelas de Ficción');
    v_listing_monitor_id INT := (SELECT id FROM listings WHERE title = 'Monitor Gamer 24" Full HD');
BEGIN
    -- Solo se registra si no existe ya el intercambio (evita duplicados y errores)
    IF v_listing_libros_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exchanges WHERE listing_id = v_listing_libros_id) THEN
        -- Se cambia el estado a 'activa' para que el SP funcione, ya que el SP la pone como 'intercambiada'
        UPDATE listings SET status = 'activa' WHERE id = v_listing_libros_id;
        CALL sp_registrar_intercambio(v_carlos_id, v_listing_libros_id, 1);
    END IF;
    
    IF v_listing_monitor_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM exchanges WHERE listing_id = v_listing_monitor_id) THEN
        UPDATE listings SET status = 'activa' WHERE id = v_listing_monitor_id;
        CALL sp_registrar_intercambio(v_roberto_id, v_listing_monitor_id, 1);
    END IF;
END $$;
-- Balance esperado Roberto: 215 - 80 (monitor) = 135

-- 5. RECLAMOS (para datos de reportes)
DO $$
DECLARE
    v_exchange1_id INT := (SELECT id FROM exchanges WHERE listing_id = (SELECT id FROM listings WHERE title = 'Lote de 5 Novelas de Ficción'));
    v_exchange2_id INT := (SELECT id FROM exchanges WHERE listing_id = (SELECT id FROM listings WHERE title = 'Monitor Gamer 24" Full HD'));
    v_carlos_id INT := (SELECT id FROM users WHERE email = 'carlos@eco.com');
    v_roberto_id INT := (SELECT id FROM users WHERE email = 'roberto@eco.com');
BEGIN
    IF v_exchange1_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM claims WHERE exchange_id = v_exchange1_id) THEN
        INSERT INTO claims (exchange_id, claimant_id, reason, status, created_at)
        VALUES (v_exchange1_id, v_carlos_id, 'Los libros estaban en peor estado de lo descrito.', 'resuelto', NOW() - INTERVAL '48 days');
    END IF;
    IF v_exchange2_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM claims WHERE exchange_id = v_exchange2_id) THEN
        INSERT INTO claims (exchange_id, claimant_id, reason, status, created_at)
        VALUES (v_exchange2_id, v_roberto_id, 'El monitor no enciende, tiene un pixel muerto.', 'abierto', NOW() - INTERVAL '17 days');
    END IF;
END $$;