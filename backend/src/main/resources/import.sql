-- Datos Semilla para Desarrollo Local
-- Este archivo es ejecutado automaticamente por Hibernate al iniciar cuando ddl-auto es "create" o "create-drop"

-- Insertar roles obligatorios
INSERT INTO roles (id_rol, nombre) VALUES (1, 'COMPRADOR');
INSERT INTO roles (id_rol, nombre) VALUES (2, 'VENDEDOR');

-- Insertar categorias iniciales para la joyeria
INSERT INTO categorias (id_categoria, nombre) VALUES (1, 'Anillos');
INSERT INTO categorias (id_categoria, nombre) VALUES (2, 'Collares');
INSERT INTO categorias (id_categoria, nombre) VALUES (3, 'Pulseras');
INSERT INTO categorias (id_categoria, nombre) VALUES (4, 'Aros');
