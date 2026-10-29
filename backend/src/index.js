import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { ticketsRouter } from './tickets.routes.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/tickets', ticketsRouter);

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Error de conexión con MySQL:', error.code);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

app.use((error, _req, res, _next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'El cuerpo debe contener JSON válido.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ message: 'La solicitud es demasiado grande.' });
  }
  console.error('Error al procesar la solicitud:', error.code || error.message);
  res.status(500).json({ message: 'No se pudo completar la operación. Intenta nuevamente.' });
});

const server = app.listen(port, () => {
  console.log(`API disponible en http://localhost:${server.address().port}`);
});
