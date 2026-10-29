CREATE DATABASE IF NOT EXISTS soporte_tecnico
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE soporte_tecnico;

CREATE TABLE IF NOT EXISTS tickets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  asunto VARCHAR(200) NOT NULL,
  solicitante VARCHAR(150) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  prioridad ENUM('baja', 'media', 'alta') NOT NULL DEFAULT 'media',
  estado ENUM('pendiente', 'en_proceso', 'resuelto') NOT NULL DEFAULT 'pendiente',
  fechaRegistro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
