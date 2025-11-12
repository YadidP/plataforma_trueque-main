-- Categorías base
INSERT INTO categories (name) VALUES
('Ropa'),
('Tecnología'),
('Educación'),
('Transporte'),
('Hogar'),
('Servicios')
ON CONFLICT (name) DO NOTHING;

-- Categorías adicionales
INSERT INTO categories (name) VALUES ('Libros') ON CONFLICT (name) DO NOTHING;

INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Administrador', 'admin@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'admin'),
(2, 'Emprendedor Verde', 'emprendedor@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'emprendedor'),
(3, 'Usuario Prueba', 'usuario@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario')
ON CONFLICT (id) DO NOTHING;

INSERT INTO entrepreneur_profiles (user_id, business_name, validation_status)
VALUES (2, 'EcoTienda Andina', 'validado')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Libros'), 'Libro Tapa Blanda'),
((SELECT id FROM categories WHERE name = 'Ropa'), 'Camiseta Algodón');

INSERT INTO materials (name) VALUES
('Papel'),
('Algodón');

INSERT INTO impact_metrics (code, name, unit) VALUES
('CO2', 'Dióxido de Carbono', 'kg'),
('WATER', 'Agua', 'L');

INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference)
VALUES
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 100, 'hojas', 1, 'Por cada 100 hojas = 1 kg CO2 evitado'),
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 100, 'hojas', 10, 'Por cada 100 hojas = 10 L agua ahorrada'),
((SELECT id FROM materials WHERE name = 'Algodón'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 2, 'Por cada kg de algodón = 2 kg CO2 evitado');