-- Migración de respaldo: Spec 043 (Pistas: precio_hora y estado)
-- Compatible con MySQL / Aiven. Idempotente y seguro para tablas con datos existentes.

-- 1. Añadir columna precio_hora si no existe con valor por defecto 20.00
ALTER TABLE pistas 
ADD COLUMN IF NOT EXISTS precio_hora DECIMAL(10,2) DEFAULT 20.00;

-- 2. Añadir columna estado si no existe con valor por defecto 'ACTIVA'
ALTER TABLE pistas 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'ACTIVA';

-- 3. Asegurar que las pistas existentes sin precio o estado adquieran los valores por defecto
UPDATE pistas SET precio_hora = 20.00 WHERE precio_hora IS NULL;
UPDATE pistas SET estado = 'ACTIVA' WHERE estado IS NULL;
