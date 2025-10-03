-- Creación de tablas para encuestas (nombres en español)
-- Archivo: create_encuestas_sorteos.sql
-- Fecha: 2025-10-03

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Tabla principal de encuestas
CREATE TABLE IF NOT EXISTS `encuestas_sorteos` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `id_evento` INT DEFAULT NULL COMMENT 'Id del evento si aplica',
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT DEFAULT NULL,
  `anonima` TINYINT(1) NOT NULL DEFAULT 1,
  `activa` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Preguntas de la encuesta
CREATE TABLE IF NOT EXISTS `preguntas_encuestas` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `encuesta_id` INT NOT NULL,
  `orden` INT DEFAULT 0,
  `texto_pregunta` TEXT NOT NULL,
  `tipo_pregunta` ENUM('valoracion','texto','si_no','multiseleccion','seleccion_simple','frecuencia') NOT NULL,
  `requerido` TINYINT(1) NOT NULL DEFAULT 1,
  `meta` INT DEFAULT NULL COMMENT 'Valor numérico auxiliar (ej. max. para valoracion: 5)',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_preguntas_encuestas_encuesta` FOREIGN KEY (`encuesta_id`) REFERENCES `encuestas_sorteos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Opciones para preguntas (por si en el futuro se añaden preguntas tipo selección)
CREATE TABLE IF NOT EXISTS `opciones_pregunta` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `pregunta_id` INT NOT NULL,
  `clave_opcion` VARCHAR(100) NOT NULL,
  `texto_opcion` VARCHAR(255) NOT NULL,
  `orden` INT DEFAULT 0,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_opciones_pregunta_pregunta` FOREIGN KEY (`pregunta_id`) REFERENCES `preguntas_encuestas`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Envios (cada vez que se aplica la encuesta)
CREATE TABLE IF NOT EXISTS `envios_encuestas` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `encuesta_id` INT NOT NULL,
  `id_registrador` INT DEFAULT NULL,
  `id_tipo_registrador` INT DEFAULT NULL COMMENT 'Snapshot: id del tipo de registrador al momento del envio',
  `nombre_tipo_registrador` VARCHAR(100) DEFAULT NULL COMMENT 'Snapshot: nombre del tipo de registrador al momento del envio',
  `id_brigada` INT DEFAULT NULL,
  `id_evento` INT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_envios_encuestas_encuesta` FOREIGN KEY (`encuesta_id`) REFERENCES `encuestas_sorteos`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_envios_encuestas_registrador` FOREIGN KEY (`id_registrador`) REFERENCES `registrador`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_envios_encuestas_brigada` FOREIGN KEY (`id_brigada`) REFERENCES `brigadas`(`id_brigada`) ON DELETE SET NULL,
  CONSTRAINT `fk_envios_encuestas_tipo_registrador` FOREIGN KEY (`id_tipo_registrador`) REFERENCES `tipos_registradores`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Respuestas por pregunta
CREATE TABLE IF NOT EXISTS `respuestas_encuestas` (
  `id` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `envio_id` INT NOT NULL,
  `pregunta_id` INT NOT NULL,
  `opcion_id` INT DEFAULT NULL,
  `respuesta_texto` TEXT DEFAULT NULL,
  `respuesta_numerica` INT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_respuestas_encuestas_envio` FOREIGN KEY (`envio_id`) REFERENCES `envios_encuestas`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_respuestas_encuestas_pregunta` FOREIGN KEY (`pregunta_id`) REFERENCES `preguntas_encuestas`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_respuestas_encuestas_opcion` FOREIGN KEY (`opcion_id`) REFERENCES `opciones_pregunta`(`id`) ON DELETE SET NULL,
  INDEX `idx_pregunta_envio` (`pregunta_id`,`envio_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Seed inicial: crear una encuesta y sus 4 preguntas (valoracion 1-5, texto, si/no, valoracion 1-5)
INSERT INTO `encuestas_sorteos` (`id`,`id_evento`,`titulo`,`descripcion`,`anonima`,`activa`,`created_at`) VALUES
(1, 1, 'Encuesta Brigada - Post Evento', 'Encuesta corta aplicada en brigadas para recoger satisfacción y necesidades', 1, 1, NOW());

INSERT INTO `preguntas_encuestas` (`id`,`encuesta_id`,`orden`,`texto_pregunta`,`tipo_pregunta`,`requerido`,`meta`,`created_at`) VALUES
(1, 1, 1, '¿Cómo califica la brigada del día de hoy?', 'valoracion', 1, 5, NOW()),
(2, 1, 2, '¿Qué otros servicios le gustaría que se brinde en la brigada?', 'texto', 0, NULL, NOW()),
(3, 1, 3, '¿Le gustaría recibir notificaciones de futuras actividades de Pancho Tamariz vía WhatsApp?', 'si_no', 1, NULL, NOW()),
(4, 1, 4, '¿Cómo califica la atención recibida por parte del personal de la brigada?', 'valoracion', 1, 5, NOW());
(5, 1, 5, '¿Con qué frecuencia le gustaría que se realicen estas brigadas?', 'frecuencia', 1, NULL, NOW());
-- Ajuste de AUTO_INCREMENT por si se ejecuta en DB limpia
ALTER TABLE `encuestas_sorteos` AUTO_INCREMENT = 2;
ALTER TABLE `preguntas_encuestas` AUTO_INCREMENT = 5;
ALTER TABLE `opciones_pregunta` AUTO_INCREMENT = 1;
ALTER TABLE `envios_encuestas` AUTO_INCREMENT = 1;
ALTER TABLE `respuestas_encuestas` AUTO_INCREMENT = 1;

-- FIN del archivo
