-- Ejecutar manualmente en MySQL si ya existen reservas antiguas sin usuario.
-- 1) Agregar columna nullable temporalmente.
ALTER TABLE reservas ADD COLUMN usuario_id BIGINT NULL;

-- 2) Asignar usuario por defecto a reservas antiguas.
-- Cambia el valor 1 por un id de usuario valido en tu BD.
UPDATE reservas SET usuario_id = 1 WHERE usuario_id IS NULL;

-- 3) Convertir a obligatoria y agregar FK + indice.
ALTER TABLE reservas MODIFY COLUMN usuario_id BIGINT NOT NULL;
ALTER TABLE reservas ADD CONSTRAINT fk_reserva_usuario FOREIGN KEY (usuario_id) REFERENCES usuario(id);
CREATE INDEX idx_reservas_usuario_id ON reservas(usuario_id);

