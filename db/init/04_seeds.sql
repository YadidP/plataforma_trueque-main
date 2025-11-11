-- Categorías base y factores de CO2 (aprox)
INSERT INTO categories (name, co2_factor) VALUES
('Ropa', 2.0),
('Tecnología', 10.0),
('Educación', 0.0),
('Transporte', 0.5),
('Hogar', 5.0),
('Servicios', 0.0)
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Administrador', 'admin@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'admin'),
(2, 'Emprendedor Verde', 'emprendedor@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'emprendedor'),
(3, 'Usuario Prueba', 'usuario@eco.com', '$2b$10$sB9PULm8WUb2evR.ZKsW9ex9xHXSyLnwkkUc2MOpM5Ye1FAF9B7/G', 'usuario')
ON CONFLICT (id) DO NOTHING;

INSERT INTO entrepreneur_profiles (user_id, business_name, validation_status)
VALUES (2, 'EcoTienda Andina', 'validado')
ON CONFLICT (user_id) DO NOTHING;