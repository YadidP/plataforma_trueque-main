-- db/init/04_seeds.sql (VERSIÓN EXTENDIDA)

-- Insertar Categorías
INSERT INTO categories (name) VALUES
('Electrónica'), ('Ropa y Accesorios'), ('Libros y Papelería'), ('Hogar y Decoración'),
('Deportes y Ocio'), ('Juguetes y Niños'), ('Herramientas y Bricolaje'),
('Salud y Belleza'), ('Alimentos y Bebidas'), ('Servicios')
ON CONFLICT (name) DO NOTHING;

-- Insertar Subcategorías
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Smartphones'),
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Laptops'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Camisetas'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Pantalones'),
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Novelas'),
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Texto'),
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Muebles'),
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Decoración'),
((SELECT id FROM categories WHERE name = 'Servicios'), 'Clases Particulares'),
((SELECT id FROM categories WHERE name = 'Servicios'), 'Reparaciones')
ON CONFLICT (category_id, name) DO NOTHING;

-- Insertar Materiales
INSERT INTO materials (name) VALUES ('Plástico'), ('Metal'), ('Madera'), ('Tela (Algodón)'), ('Vidrio'), ('Papel') ON CONFLICT (name) DO NOTHING;

-- Insertar Métricas de Impacto
INSERT INTO impact_metrics (code, name, unit) VALUES ('CO2', 'Dióxido de Carbono', 'kg'), ('WATER', 'Agua', 'L'), ('ENERGY', 'Energía', 'kWh') ON CONFLICT (code) DO NOTHING;

-- Insertar Equivalencias de Impacto
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value) VALUES
((SELECT id FROM materials WHERE name = 'Plástico'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 3.5),
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 7500),
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 0.9)
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;


-- Usuarios de prueba (10 usuarios para variedad)
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
('Nuevo Usuario', 'nuevo@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario', NOW() - INTERVAL '2 days')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;

-- Billeteras iniciales
INSERT INTO wallets (user_id, balance) 
SELECT id, 100.00 FROM users ON CONFLICT (user_id) DO NOTHING;

-- Suscripciones
INSERT INTO subscriptions (name, price_bs, duration_days, description) VALUES
('Premium Mensual', 35.00, 30, 'Visibilidad mejorada.'),
('Premium Trimestral', 90.00, 90, 'Ahorra un 15%.'),
('Premium Anual', 300.00, 365, 'El mejor valor.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO user_subscriptions (user_id, subscription_id, start_date, end_date, is_active)
SELECT id, (SELECT id FROM subscriptions WHERE name = 'Premium Mensual'), NOW(), NOW() + INTERVAL '30 days', true
FROM users WHERE role = 'emprendedor';

-- Publicaciones (Listings) - Variedad de fechas y categorías
INSERT INTO listings (author_id, title, description, category_id, subcategory_id, unit_credits, image_url, created_at, status) VALUES
-- Antiguas
((SELECT id FROM users WHERE email='emprendedor@eco.com'), 'Sillas de Madera', 'Restauradas.', (SELECT id FROM categories WHERE name='Hogar y Decoración'), (SELECT id FROM subcategories WHERE name='Muebles'), 50, '/uploads/sillas.jpg', NOW() - INTERVAL '60 days', 'activa'),
((SELECT id FROM users WHERE email='ana@eco.com'), 'Libros Varios', 'Lote de novelas.', (SELECT id FROM categories WHERE name='Libros y Papelería'), (SELECT id FROM subcategories WHERE name='Novelas'), 15, '/uploads/libros.jpg', NOW() - INTERVAL '55 days', 'intercambiada'),
-- Mes pasado
((SELECT id FROM users WHERE email='carlos@eco.com'), 'Bicicleta Montaña', 'Buen estado.', (SELECT id FROM categories WHERE name='Deportes y Ocio'), (SELECT id FROM subcategories WHERE name='Muebles'), 120, '/uploads/bici.jpg', NOW() - INTERVAL '25 days', 'activa'),
((SELECT id FROM users WHERE email='lucia@eco.com'), 'Monitor 24"', 'Full HD.', (SELECT id FROM categories WHERE name='Electrónica'), (SELECT id FROM subcategories WHERE name='Laptops'), 80, '/uploads/monitor.jpg', NOW() - INTERVAL '20 days', 'intercambiada'),
-- Recientes
((SELECT id FROM users WHERE email='roberto@eco.com'), 'Clases Matemáticas', 'Por hora.', (SELECT id FROM categories WHERE name='Servicios'), (SELECT id FROM subcategories WHERE name='Clases Particulares'), 20, '/uploads/clases.jpg', NOW() - INTERVAL '5 days', 'activa'),
((SELECT id FROM users WHERE email='tienda@eco.com'), 'Jabones Artesanales', 'Pack de 3.', (SELECT id FROM categories WHERE name='Salud y Belleza'), (SELECT id FROM subcategories WHERE name='Muebles'), 10, '/uploads/jabones.jpg', NOW() - INTERVAL '3 days', 'activa'),
((SELECT id FROM users WHERE email='emprendedor@eco.com'), 'Mesa de Centro', 'Madera reciclada.', (SELECT id FROM categories WHERE name='Hogar y Decoración'), (SELECT id FROM subcategories WHERE name='Muebles'), 45, '/uploads/mesa.jpg', NOW() - INTERVAL '2 days', 'activa'),
((SELECT id FROM users WHERE email='ana@eco.com'), 'Ropa Bebé', 'Lote variado.', (SELECT id FROM categories WHERE name='Ropa y Accesorios'), (SELECT id FROM subcategories WHERE name='Camisetas'), 25, '/uploads/ropa.jpg', NOW() - INTERVAL '1 day', 'activa');


-- Compras de Créditos (Monetización)
INSERT INTO credit_purchases (user_id, credits, amount_bs, status, purchase_date) VALUES
((SELECT id FROM users WHERE email='carlos@eco.com'), 100, 100.00, 'pagado', NOW() - INTERVAL '28 days'),
((SELECT id FROM users WHERE email='lucia@eco.com'), 50, 50.00, 'pagado', NOW() - INTERVAL '15 days'),
((SELECT id FROM users WHERE email='roberto@eco.com'), 200, 200.00, 'pagado', NOW() - INTERVAL '10 days'),
((SELECT id FROM users WHERE email='nuevo@eco.com'), 20, 20.00, 'pagado', NOW() - INTERVAL '1 day');

-- Intercambios (Exchanges)
INSERT INTO exchanges (listing_id, buyer_id, seller_id, quantity, credits_per_unit, credits_total, exchange_date) VALUES
-- Intercambio 1 (Libros de Ana comprados por Carlos)
((SELECT id FROM listings WHERE title='Libros Varios'), 
 (SELECT id FROM users WHERE email='carlos@eco.com'), 
 (SELECT id FROM users WHERE email='ana@eco.com'), 
 1, 15, 15, NOW() - INTERVAL '50 days'),
 
-- Intercambio 2 (Monitor de Lucia comprado por Roberto)
((SELECT id FROM listings WHERE title='Monitor 24"'), 
 (SELECT id FROM users WHERE email='roberto@eco.com'), 
 (SELECT id FROM users WHERE email='lucia@eco.com'), 
 1, 80, 80, NOW() - INTERVAL '18 days');

-- Logs de Créditos (Para reflejar actividad)
-- Compra Carlos
INSERT INTO credits_log (user_id, operation_type, delta, balance_after, log_date) VALUES
((SELECT id FROM users WHERE email='carlos@eco.com'), 'compra_creditos', 100, 100, NOW() - INTERVAL '28 days');
-- Compra Lucia
INSERT INTO credits_log (user_id, operation_type, delta, balance_after, log_date) VALUES
((SELECT id FROM users WHERE email='lucia@eco.com'), 'compra_creditos', 50, 50, NOW() - INTERVAL '15 days');
-- Intercambio 1 (Carlos gasta, Ana recibe)
INSERT INTO credits_log (user_id, operation_type, delta, balance_after, log_date) VALUES
((SELECT id FROM users WHERE email='carlos@eco.com'), 'intercambio_debito', -15, 85, NOW() - INTERVAL '50 days'),
((SELECT id FROM users WHERE email='ana@eco.com'), 'intercambio_credito', 15, 115, NOW() - INTERVAL '50 days');


-- Reclamos
INSERT INTO claims (exchange_id, claimant_id, reason, status, created_at) VALUES
((SELECT id FROM exchanges WHERE credits_total=15 LIMIT 1), (SELECT id FROM users WHERE email='carlos@eco.com'), 'Libros en mal estado', 'resuelto', NOW() - INTERVAL '48 days'),
((SELECT id FROM exchanges WHERE credits_total=80 LIMIT 1), (SELECT id FROM users WHERE email='roberto@eco.com'), 'No enciende', 'abierto', NOW() - INTERVAL '17 days');