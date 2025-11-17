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

-- Insertar Métricas de Impacto - ROBUSTAS Y BIEN CALIBRADAS
INSERT INTO impact_metrics (code, name, unit) VALUES
('CO2', 'Dióxido de Carbono', 'kg'),
('WATER', 'Agua', 'L'),
('ENERGY', 'Energía', 'kWh'),
('WASTE', 'Residuos Evitados', 'kg'),
('PESTICIDES', 'Pesticidas', 'g')
ON CONFLICT (code) DO NOTHING;

-- Insertar Equivalencias de Impacto (ejemplos realistas y optimistas para fomentar intercambios)
-- Plástico: Muy impactante, reutilización es muy valiosa
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Plástico'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 3.5, 'Fuente: Estudio de ciclo de vida de plásticos - Producción y transporte'),
((SELECT id FROM materials WHERE name = 'Plástico'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 100, 'Fuente: Agua para refinería de petróleo'),
((SELECT id FROM materials WHERE name = 'Plástico'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 1, 'kg', 80, 'Fuente: Energía de producción (en MJ convertido a kWh)'),
((SELECT id FROM materials WHERE name = 'Plástico'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 1, 'kg', 1.0, 'Fuente: Residuo completamente evitado')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Metal: Alto impacto energético, especialmente aluminio
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Metal'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 12, 'Fuente: Producción de aluminio reciclado vs nuevo'),
((SELECT id FROM materials WHERE name = 'Metal'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 200, 'Fuente: Refinerías de metal'),
((SELECT id FROM materials WHERE name = 'Metal'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 1, 'kg', 10, 'Fuente: Energía de refinería'),
((SELECT id FROM materials WHERE name = 'Metal'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 1, 'kg', 1.0, 'Fuente: Metal reutilizable totalmente')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Madera: Bajo impacto si es sostenible
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Madera'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 0.3, 'Fuente: Madera sostenible (carbono secuestrado)'),
((SELECT id FROM materials WHERE name = 'Madera'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 30, 'Fuente: Agua de crecimiento de árbol'),
((SELECT id FROM materials WHERE name = 'Madera'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 0.5, 'kg', 2, 'Fuente: Energía mínima de procesamiento'),
((SELECT id FROM materials WHERE name = 'Madera'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 1, 'kg', 1.0, 'Fuente: Madera completamente reciclable/biodegradable')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Tela (Algodón): Alto impacto en agua y pesticidas
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 5, 'Fuente: Producción y transporte de algodón'),
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 7500, 'Fuente: Cultivo intensivo de algodón (muy thirsty)'),
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 1, 'kg', 12, 'Fuente: Procesamiento y teñido'),
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 1, 'kg', 1.0, 'Fuente: Ropa completamente evitada en basura'),
((SELECT id FROM materials WHERE name = 'Tela (Algodón)'), (SELECT id FROM impact_metrics WHERE code = 'PESTICIDES'), 1, 'kg', 8, 'Fuente: Pesticidas en cultivo de algodón convencional (en g)')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Papel: Moderado, especialmente si es reciclado
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 1.5, 'Fuente: Producción de papel reciclado'),
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 80, 'Fuente: Tratamiento de agua en fábricas'),
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 1, 'kg', 4, 'Fuente: Producción de papel'),
((SELECT id FROM materials WHERE name = 'Papel'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 1, 'kg', 1.0, 'Fuente: Papel biodegradable completamente')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Vidrio: Bajo impacto si es reciclado
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Vidrio'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 0.5, 'Fuente: Producción de vidrio reciclado'),
((SELECT id FROM materials WHERE name = 'Vidrio'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 10, 'Fuente: Enfriamiento en fábricas'),
((SELECT id FROM materials WHERE name = 'Vidrio'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 1, 'kg', 1.5, 'Fuente: Fusión de vidrio reciclado'),
((SELECT id FROM materials WHERE name = 'Vidrio'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 1, 'kg', 1.0, 'Fuente: Vidrio 100% reciclable indefinidamente')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Cerámica: Bajo impacto
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Cerámica'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 1.2, 'Fuente: Cocción de cerámica'),
((SELECT id FROM materials WHERE name = 'Cerámica'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 20, 'Fuente: Procesamiento'),
((SELECT id FROM materials WHERE name = 'Cerámica'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 1, 'kg', 3, 'Fuente: Cocción en horno'),
((SELECT id FROM materials WHERE name = 'Cerámica'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 1, 'kg', 1.0, 'Fuente: Cerámica biodegradable')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Cuero: Muy alto impacto (animal y químicos)
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Cuero'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 25, 'Fuente: Ganado y transporte'),
((SELECT id FROM materials WHERE name = 'Cuero'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 20000, 'Fuente: Crianza de ganado'),
((SELECT id FROM materials WHERE name = 'Cuero'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 1, 'kg', 15, 'Fuente: Curtido y procesamiento'),
((SELECT id FROM materials WHERE name = 'Cuero'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 1, 'kg', 1.0, 'Fuente: Evitar nuevo cuero')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Goma: Moderado-Alto
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Goma'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 4, 'Fuente: Producción de goma'),
((SELECT id FROM materials WHERE name = 'Goma'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 150, 'Fuente: Plantaciones de caucho'),
((SELECT id FROM materials WHERE name = 'Goma'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 1, 'kg', 8, 'Fuente: Vulcanización'),
((SELECT id FROM materials WHERE name = 'Goma'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 1, 'kg', 1.0, 'Fuente: Goma reutilizable')
ON CONFLICT (material_id, metric_id, base_unit) DO NOTHING;

-- Componentes Electrónicos: Muy alto impacto
INSERT INTO impact_equivalences (material_id, metric_id, base_quantity, base_unit, impact_value, source_reference) VALUES
((SELECT id FROM materials WHERE name = 'Componentes Electrónicos'), (SELECT id FROM impact_metrics WHERE code = 'CO2'), 1, 'kg', 15, 'Fuente: Manufactura electrónica'),
((SELECT id FROM materials WHERE name = 'Componentes Electrónicos'), (SELECT id FROM impact_metrics WHERE code = 'WATER'), 1, 'kg', 300, 'Fuente: Fábricas semiconductoras'),
((SELECT id FROM materials WHERE name = 'Componentes Electrónicos'), (SELECT id FROM impact_metrics WHERE code = 'ENERGY'), 1, 'kg', 50, 'Fuente: Industria electrónica muy intensiva'),
((SELECT id FROM materials WHERE name = 'Componentes Electrónicos'), (SELECT id FROM impact_metrics WHERE code = 'WASTE'), 0.5, 'kg', 1.0, 'Fuente: Evitar e-waste tóxico')
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
-- db/init/04_seeds.sql (AÑADIR AL FINAL)

-- Insertar Tipos de Suscripción
INSERT INTO subscriptions (name, price_bs, duration_days, description) VALUES
('Premium Mensual', 35.00, 30, 'Visibilidad mejorada y acceso a estadísticas.'),
('Premium Trimestral', 90.00, 90, 'Ahorra un 15% con el plan trimestral.'),
('Premium Anual', 300.00, 365, 'El mejor valor, ahorra un 30% anualmente.')
ON CONFLICT (id) DO NOTHING;

-- Asignar suscripción de ejemplo a un usuario
INSERT INTO user_subscriptions (user_id, subscription_id, start_date, end_date, is_active)
SELECT 
    u.id, 
    s.id, 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP + (s.duration_days * INTERVAL '1 day'), 
    true
FROM users u, subscriptions s
WHERE u.email = 'emprendedor@eco.com' AND s.name = 'Premium Mensual'
ON CONFLICT (id) DO NOTHING;