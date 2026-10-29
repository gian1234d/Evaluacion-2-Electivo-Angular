import { Router } from 'express';
import { pool } from './db.js';

export const ticketsRouter = Router();
const campos = ['asunto', 'solicitante', 'descripcion', 'categoria', 'prioridad', 'estado'];
const limites = { asunto: 200, solicitante: 150, categoria: 100 };

function validarTicket(body) {
  const datos = {};
  const errores = [];
  for (const campo of campos) {
    const valor = typeof body?.[campo] === 'string' ? body[campo].trim() : '';
    datos[campo] = valor;
    if (!valor) errores.push(`${campo} es obligatorio.`);
    if (limites[campo] && [...valor].length > limites[campo]) {
      errores.push(`${campo} admite hasta ${limites[campo]} caracteres.`);
    }
  }
  if (Buffer.byteLength(datos.descripcion, 'utf8') > 65535) {
    errores.push('descripcion es demasiado extensa.');
  }
  if (datos.prioridad && !['baja', 'media', 'alta'].includes(datos.prioridad)) {
    errores.push('prioridad debe ser baja, media o alta.');
  }
  if (datos.estado && !['pendiente', 'en_proceso', 'resuelto'].includes(datos.estado)) {
    errores.push('estado debe ser pendiente, en_proceso o resuelto.');
  }
  return { datos, errores };
}

ticketsRouter.param('id', (req, res, next, id) => {
  if (!/^[1-9]\d*$/.test(id) || Number(id) > 4294967295) {
    return res.status(400).json({ message: 'El ID debe ser un entero positivo válido.' });
  }
  next();
});

ticketsRouter.get('/', async (_req, res) => {
  const [tickets] = await pool.execute('SELECT * FROM tickets ORDER BY fechaRegistro DESC, id DESC');
  res.json(tickets);
});

ticketsRouter.get('/:id', async (req, res) => {
  const [tickets] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  if (!tickets.length) return res.status(404).json({ message: 'Ticket no encontrado.' });
  res.json(tickets[0]);
});

ticketsRouter.post('/', async (req, res) => {
  const { datos, errores } = validarTicket(req.body);
  if (errores.length) return res.status(400).json({ message: 'Datos inválidos.', errores });
  const [resultado] = await pool.execute(
    'INSERT INTO tickets (asunto, solicitante, descripcion, categoria, prioridad, estado) VALUES (?, ?, ?, ?, ?, ?)',
    campos.map(campo => datos[campo]),
  );
  const [tickets] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [resultado.insertId]);
  res.status(201).location(`/api/tickets/${resultado.insertId}`).json(tickets[0]);
});

ticketsRouter.put('/:id', async (req, res) => {
  const { datos, errores } = validarTicket(req.body);
  if (errores.length) return res.status(400).json({ message: 'Datos inválidos.', errores });
  const [resultado] = await pool.execute(
    'UPDATE tickets SET asunto = ?, solicitante = ?, descripcion = ?, categoria = ?, prioridad = ?, estado = ? WHERE id = ?',
    [...campos.map(campo => datos[campo]), req.params.id],
  );
  if (!resultado.affectedRows) return res.status(404).json({ message: 'Ticket no encontrado.' });
  const [tickets] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
  res.json(tickets[0]);
});

ticketsRouter.delete('/:id', async (req, res) => {
  const [resultado] = await pool.execute('DELETE FROM tickets WHERE id = ?', [req.params.id]);
  if (!resultado.affectedRows) return res.status(404).json({ message: 'Ticket no encontrado.' });
  res.status(204).end();
});
