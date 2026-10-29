import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Error de conexión con MySQL:', error.code);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

app.listen(port, () => {
  console.log(`API disponible en http://localhost:${port}`);
});
