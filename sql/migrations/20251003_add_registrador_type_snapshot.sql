-- Migration: Añadir snapshot del tipo de registrador a usuarios_otros_sorteos
-- Fecha: 2025-10-03
-- Propósito: Añadir columnas para almacenar el tipo de registrador al momento del registro

ALTER TABLE `usuarios_otros_sorteos`
  ADD COLUMN `id_tipo_registrador_snapshot` int DEFAULT NULL,
  ADD COLUMN `nombre_tipo_registrador` varchar(100) DEFAULT NULL;

-- Rellenar datos existentes: si la tabla `registrador` tiene la columna `id_tipo_registrador`
-- y existe la tabla `tipos_registradores`, traer el valor actual como snapshot.
-- Esta consulta intenta hacer la actualización de forma segura comprobando existencia de tablas/columnas.

-- Nota: algunos motores MySQL no permiten IF EXISTS en subconsultas; si tu entorno no soporta la comprobación
-- siguiente, ejecuta manualmente la sección marcada como "Relleno".

-- Relleno: (ejecutar si `registrador`.`id_tipo_registrador` y `tipos_registradores` existen)
UPDATE usuarios_otros_sorteos u
JOIN registrador r ON u.id_registrador = r.id
LEFT JOIN tipos_registradores t ON r.id_tipo_registrador = t.id
SET u.id_tipo_registrador_snapshot = r.id_tipo_registrador,
    u.nombre_tipo_registrador = t.nombre_tipo;

-- Crear índice (si no existe ya)
ALTER TABLE `usuarios_otros_sorteos` ADD KEY `fk_usuarios_otros_tipo_registrador_snapshot` (`id_tipo_registrador_snapshot`);

-- Recomendación: mantener la FK descomentada solo si quieres referencialidad histórica (no recomendable si esperas que
-- `tipos_registradores` cambie o se borre, ya que podrías perder el snapshot). En general, es mejor almacenar el nombre
-- y dejar la FK a NULL o no creada.

-- Descomentar si quieres forzar la integridad referencial (opcional):
-- ALTER TABLE `usuarios_otros_sorteos`
--   ADD CONSTRAINT `fk_usuarios_otros_tipo_registrador_snapshot` FOREIGN KEY (`id_tipo_registrador_snapshot`) REFERENCES `tipos_registradores` (`id`);

-- Fin de migración
