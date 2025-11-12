-- db/init/04_seeds.sql

-- Insertar Categorías
INSERT INTO categories (name) VALUES
('Electrónica'),
('Ropa y Accesorios'),
('Libros y Papelería'),
('Hogar y Decoración'),
('Deportes y Ocio'),
('Juguetes y Niños'),
('Herramientas y Bricolaje'),
('Salud y Belleza'),
('Alimentos y Bebidas'),
('Servicios')
ON CONFLICT (name) DO NOTHING;

-- Insertar Subcategorías
-- Electrónica
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Smartphones'),
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Laptops'),
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Tablets'),
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Componentes PC'),
((SELECT id FROM categories WHERE name = 'Electrónica'), 'Electrodomésticos Pequeños')
ON CONFLICT (category_id, name) DO NOTHING;

-- Ropa y Accesorios
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Camisetas'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Pantalones'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Abrigos'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Zapatos'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Bolsos'),
((SELECT id FROM categories WHERE name = 'Ropa y Accesorios'), 'Joyas')
ON CONFLICT (category_id, name) DO NOTHING;

-- Libros y Papelería
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Novelas'),
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Libros de Texto'),
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Material Escolar'),
((SELECT id FROM categories WHERE name = 'Libros y Papelería'), 'Revistas')
ON CONFLICT (category_id, name) DO NOTHING;

-- Hogar y Decoración
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Muebles'),
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Decoración'),
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Utensilios de Cocina'),
((SELECT id FROM categories WHERE name = 'Hogar y Decoración'), 'Textiles de Hogar')
ON CONFLICT (category_id, name) DO NOTHING;

-- Deportes y Ocio
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Deportes y Ocio'), 'Equipamiento Deportivo'),
((SELECT id FROM categories WHERE name = 'Deportes y Ocio'), 'Juegos de Mesa'),
((SELECT id FROM categories WHERE name = 'Deportes y Ocio'), 'Instrumentos Musicales')
ON CONFLICT (category_id, name) DO NOTHING;

-- Juguetes y Niños
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Juguetes y Niños'), 'Juguetes Educativos'),
((SELECT id FROM categories WHERE name = 'Juguetes y Niños'), 'Ropa de Bebé'),
((SELECT id FROM categories WHERE name = 'Juguetes y Niños'), 'Coches de Paseo')
ON CONFLICT (category_id, name) DO NOTHING;

-- Herramientas y Bricolaje
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Herramientas y Bricolaje'), 'Herramientas Manuales'),
((SELECT id FROM categories WHERE name = 'Herramientas y Bricolaje'), 'Herramientas Eléctricas'),
((SELECT id FROM categories WHERE name = 'Herramientas y Bricolaje'), 'Materiales de Construcción')
ON CONFLICT (category_id, name) DO NOTHING;

-- Salud y Belleza
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Salud y Belleza'), 'Cuidado Facial'),
((SELECT id FROM categories WHERE name = 'Salud y Belleza'), 'Maquillaje'),
((SELECT id FROM categories WHERE name = 'Salud y Belleza'), 'Cuidado del Cabello')
ON CONFLICT (category_id, name) DO NOTHING;

-- Alimentos y Bebidas (ejemplos de productos no perecederos o de larga duración)
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Alimentos y Bebidas'), 'Conservas'),
((SELECT id FROM categories WHERE name = 'Alimentos y Bebidas'), 'Granos y Legumbres'),
((SELECT id FROM categories WHERE name = 'Alimentos y Bebidas'), 'Bebidas No Alcohólicas')
ON CONFLICT (category_id, name) DO NOTHING;

-- Servicios (ejemplos)
INSERT INTO subcategories (category_id, name) VALUES
((SELECT id FROM categories WHERE name = 'Servicios'), 'Clases Particulares'),
((SELECT id FROM categories WHERE name = 'Servicios'), 'Reparaciones'),
((SELECT id FROM categories WHERE name = 'Servicios'), 'Diseño Gráfico')
ON CONFLICT (category_id, name) DO NOTHING;


-- Insertar Materiales
INSERT INTO materials (name) VALUES
('Plástico'),
('Metal'),
('Madera'),
('Tela (Algodón)'),
('Papel'),
('Vidrio'),
('Cerámica'),
('Cuero'),
('Goma'),
('Componentes Electrónicos')
ON CONFLICT (name) DO NOTHING;

-- Insertar Métricas de Impacto
INSERT INTO impact_metrics (code, name, unit) VALUES
('CO2', 'Dióxido de Carbono', 'kg'),
('WATER', 'Agua', 'L'),
('PESTICIDES', 'Pesticidas', 'kg'),
('PLASTIC_WASTE', 'Residuos Plásticos', 'kg')
ON CONFLICT (code) DO NOTHING;

-- Insertar Equivalencias de Impacto (ejemplos realistas)
-- Plástico
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Plástico'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 1.5, 'Fuente: Estudio de ciclo de vida de plásticos'),
((SELECT id FROM materials WHERE name = 'Plástico'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 10, 'Fuente: Estudio de ciclo de vida de plásticos'),
((SELECT id FROM materials WHERE name = 'Plástico'), (SELECT id FROM impact_metrics WHERE code = 'PLASTIC_WASTE'), 1, 'unidad', 0.1, 'Fuente: Estimación de peso promedio de un envase plástico')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Metal (ej: Aluminio)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Metal'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 10, 'Fuente: Producción de aluminio reciclado'),
((SELECT id FROM materials WHERE name = 'Metal'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 50, 'Fuente: Producción de aluminio reciclado')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Madera
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Madera'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 0.5, 'Fuente: Madera sostenible'),
((SELECT id FROM materials WHERE name = 'Madera'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 20, 'Fuente: Cultivo de árboles')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Tela (Algodón)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 6, 'Fuente: Producción de algodón'),
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 10000, 'Fuente: Cultivo de algodón intensivo'),
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'PESTICIDES'), 1, 'kg', 0.1, 'Fuente: Uso de pesticidas en algodón')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Papel
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 1.2, 'Fuente: Producción de papel reciclado'),
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 50, 'Fuente: Producción de papel reciclado')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Vidrio
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Vidrio'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 0.3, 'Fuente: Producción de vidrio reciclado'),
((SELECT id FROM materials WHERE name = 'Vidrio'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 5, 'Fuente: Producción de vidrio reciclado')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Cerámica
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Cerámica'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 2, 'Fuente: Producción de cerámica'),
((SELECT id FROM materials WHERE name = 'Cerámica'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 15, 'Fuente: Producción de cerámica')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Cuero
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Cuero'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 17, 'Fuente: Producción de cuero'),
((SELECT id FROM materials WHERE name = 'Cuero'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 17000, 'Fuente: Producción de cuero')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Goma
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Goma'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 3, 'Fuente: Producción de goma'),
((SELECT id FROM materials WHERE name = 'Goma'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 30, 'Fuente: Producción de goma')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Componentes Electrónicos (ejemplo genérico)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Componentes Electrónicos'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'unidad', 0.5, 'Fuente: Estimación de impacto por componente'),
((SELECT id FROM materials WHERE name = 'Componentes Electrónicos'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'unidad', 5, 'Fuente: Estimación de impacto por componente')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;


-- Usuarios de prueba (mantener los mismos hashes para simplificar)
INSERT INTO users (name, email, password_hash, role) VALUES
('Administrador', 'admin@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'admin'),
('Emprendedor Verde', 'emprendedor@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'emprendedor'),
('Usuario Prueba', 'usuario@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario'),
('ONG Ambiental', 'ong@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'ong')
ON CONFLICT (id) DO NOTHING;

INSERT INTO entrepreneur_profiles (user_id, business_name, validation_status)
SELECT id, 'EcoTienda Andina', 'validado'
FROM users WHERE email = 'emprendedor@eco.com'
ON CONFLICT (user_id) DO NOTHING;
