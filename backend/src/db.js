import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'soporte_tecnico',
  waitForConnections: true,
  connectionLimit: 10,
  timezone: 'Z',
});

// TIMESTAMP se intercambia en UTC; Angular lo muestra en la hora local.
pool.pool.on('connection', connection => {
  connection.query("SET time_zone = '+00:00'");
});
