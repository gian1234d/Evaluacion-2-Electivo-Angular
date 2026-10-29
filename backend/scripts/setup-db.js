import 'dotenv/config';
import mysql from 'mysql2/promise';
import { randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// Ejecutar desde backend con MYSQL_ADMIN_PASSWORD en el entorno o en .env.
const envPath = resolve('.env');
const existing = await readFile(envPath, 'utf8').catch(error => {
  if (error.code === 'ENOENT') return '';
  throw error;
});
const database = process.env.DB_NAME || 'soporte_tecnico';
const user = process.env.DB_USER || 'soporte_app';
if (!/^[a-zA-Z0-9_]+$/.test(database) || !/^[a-zA-Z0-9_]+$/.test(user)) {
  throw new Error('DB_NAME y DB_USER solo admiten letras, números y guion bajo.');
}
const password = process.env.DB_PASSWORD || randomBytes(24).toString('hex');
let admin;
try {
  admin = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.MYSQL_ADMIN_USER || 'root',
    password: process.env.MYSQL_ADMIN_PASSWORD || '',
  });
  const schema = (await readFile(new URL('../sql/schema.sql', import.meta.url), 'utf8'))
    .replaceAll('soporte_tecnico', database);
  for (const statement of schema.split(';').map(value => value.trim()).filter(Boolean)) {
    await admin.query(statement);
  }
  await admin.query('CREATE USER IF NOT EXISTS ?@\'localhost\' IDENTIFIED BY ?', [user, password]);
  await admin.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON \`${database}\`.* TO ?@'localhost'`, [user]);
  // No se cambia la contraseña de usuarios existentes.
  const app = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306),
    user, password, database,
  });
  await app.end();
  const values = {
    PORT: process.env.PORT || '3000', DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: process.env.DB_PORT || '3306', DB_USER: user, DB_PASSWORD: password, DB_NAME: database,
  };
  let content = existing.replace(/^MYSQL_ADMIN_PASSWORD=.*(?:\r?\n|$)/gm, '');
  for (const [key, value] of Object.entries(values)) {
    const line = `${key}=${JSON.stringify(value)}`;
    const pattern = new RegExp(`^${key}=.*$`, 'm');
    content = pattern.test(content) ? content.replace(pattern, () => line) : `${content.trimEnd()}\n${line}\n`;
  }
  await writeFile(envPath, content.trimStart(), { mode: 0o600 });
  console.log('Base y permisos preparados. Configuración guardada en backend/.env.');
} catch (error) {
  console.error('No se pudo preparar MySQL:', error.code || error.message);
  console.error('Revisa MYSQL_ADMIN_USER, MYSQL_ADMIN_PASSWORD y los valores DB_* de backend/.env.');
  process.exitCode = 1;
} finally {
  await admin?.end();
}
