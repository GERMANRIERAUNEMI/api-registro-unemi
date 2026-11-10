-- Script de la base de datos del pre-registro UNEMI
-- Paso 1: crear la base de datos (pgAdmin → Databases → Create, o en psql):
--     CREATE DATABASE registro_unemi;
-- Paso 2: abrir el Query Tool SOBRE registro_unemi y ejecutar lo siguiente.

CREATE TABLE IF NOT EXISTS usuarios (
    id               SERIAL PRIMARY KEY,
    nombre           VARCHAR(60)  NOT NULL,
    correo           VARCHAR(120) NOT NULL UNIQUE,
    password_hash    VARCHAR(100) NOT NULL,
    edad             SMALLINT     NOT NULL CHECK (edad BETWEEN 16 AND 99),
    telefono         CHAR(10)     NOT NULL,
    carrera          VARCHAR(30)  NOT NULL
                     CHECK (carrera IN ('software', 'ti', 'industrial', 'administracion', 'educacion')),
    fecha_nacimiento DATE         NOT NULL,
    modalidad        VARCHAR(15)  NOT NULL
                     CHECK (modalidad IN ('presencial', 'en-linea', 'hibrida')),
    comentarios      VARCHAR(200) DEFAULT '',
    terminos         BOOLEAN      NOT NULL DEFAULT TRUE,
    fecha_registro   TIMESTAMP    NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP
);
