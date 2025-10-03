-- Script: add_taxista_and_users.sql
-- Agrega el tipo de registrador 'TAXISTA' (si no existe) y crea 4 usuarios en mayúsculas
-- Uso: mysql -u <user> -p <database> < add_taxista_and_users.sql

START TRANSACTION;

-- Crear el tipo 'TAXISTA' si no existe
INSERT INTO tipos_registradores (nombre_tipo, descripcion, activo)
SELECT 'TAXISTA', 'CREADO_VIA_SCRIPT', 1
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM tipos_registradores WHERE nombre_tipo = 'TAXISTA');

-- Obtener el id del tipo recién creado o existente
SET @tipo_taxista_id = (SELECT id FROM tipos_registradores WHERE nombre_tipo = 'TAXISTA' LIMIT 1);

-- Insertar registradores con tipo TAXISTA (solo si no existen)
INSERT INTO registrador (nombre_registrador, id_tipo_registrador)
SELECT 'KLEBER PILLASAGUA', @tipo_taxista_id
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM registrador WHERE UPPER(nombre_registrador) = 'KLEBER PILLASAGUA' AND id_tipo_registrador = @tipo_taxista_id
);

INSERT INTO registrador (nombre_registrador, id_tipo_registrador)
SELECT 'ALEJANDRO PARRALES', @tipo_taxista_id
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM registrador WHERE UPPER(nombre_registrador) = 'ALEJANDRO PARRALES' AND id_tipo_registrador = @tipo_taxista_id
);

INSERT INTO registrador (nombre_registrador, id_tipo_registrador)
SELECT 'EDUARDO QUIMI', @tipo_taxista_id
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM registrador WHERE UPPER(nombre_registrador) = 'EDUARDO QUIMI' AND id_tipo_registrador = @tipo_taxista_id
);

INSERT INTO registrador (nombre_registrador, id_tipo_registrador)
SELECT 'LUIS CHAVEZ', @tipo_taxista_id
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM registrador WHERE UPPER(nombre_registrador) = 'LUIS CHAVEZ' AND id_tipo_registrador = @tipo_taxista_id
);

COMMIT;

-- Nota: Si tu servidor MySQL no permite múltiples INSERTs con variables en un solo .sql
-- puedes ejecutar las partes por separado o usar un cliente que soporte estas sentencias.
