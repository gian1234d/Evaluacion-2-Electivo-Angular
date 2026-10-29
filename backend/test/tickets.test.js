import 'dotenv/config';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('CRUD, validaciones y persistencia de tickets', async () => {
  let server;
  let base;
  let id;
  async function iniciar() {
    // Puerto 0 permite que el sistema elija uno libre para esta prueba.
    server = spawn(process.execPath, ['src/index.js'], {
      cwd: process.cwd(), env: { ...process.env, PORT: '0' },
    });
    base = await new Promise((resolve, reject) => {
      let output = '';
      server.stdout.on('data', chunk => {
        output += chunk;
        const match = output.match(/http:\/\/localhost:(\d+)/);
        if (match) resolve(`http://localhost:${match[1]}/api/tickets`);
      });
      server.once('error', reject);
      server.once('exit', code => reject(new Error(`API terminó: ${code}`)));
    });
  }
  async function detener() {
    const salida = once(server, 'exit');
    server.kill();
    await salida;
  }
  const datos = {
    asunto: 'Prueba automática', solicitante: 'Verificación',
    descripcion: "Texto con comillas: ' y ?", categoria: 'Software',
    prioridad: 'media', estado: 'pendiente',
  };
  const enviar = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    await iniciar();
    assert.equal((await fetch(base, enviar('POST', {}))).status, 400);
    assert.equal((await fetch(base, enviar('POST', { ...datos, prioridad: 'urgente' }))).status, 400);
    assert.equal((await fetch(base, enviar('POST', { ...datos, asunto: 'x'.repeat(201) }))).status, 400);
    assert.equal((await fetch(`${base}/abc`)).status, 400);
    assert.equal((await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
    const creado = await fetch(base, enviar('POST', datos));
    assert.equal(creado.status, 201);
    const ticket = await creado.json();
    id = ticket.id;
    assert.ok(ticket.fechaRegistro);
    assert.equal(ticket.descripcion, datos.descripcion);
    assert.ok((await (await fetch(base)).json()).some(t => t.id === id));
    assert.equal((await fetch(`${base}/${id}`, enviar('PUT', { ...datos, estado: 'resuelto' }))).status, 200);
    // Actualizar sin cambios también debe funcionar.
    assert.equal((await fetch(`${base}/${id}`, enviar('PUT', { ...datos, estado: 'resuelto' }))).status, 200);
    await detener();
    await iniciar();
    assert.equal((await (await fetch(`${base}/${id}`)).json()).estado, 'resuelto');
    assert.equal((await fetch(`${base}/${id}`, { method: 'DELETE' })).status, 204);
    assert.equal((await fetch(`${base}/${id}`)).status, 404);
    assert.equal((await fetch(`${base}/${id}`, enviar('PUT', datos))).status, 404);
    assert.equal((await fetch(`${base}/${id}`, { method: 'DELETE' })).status, 404);
  } finally {
    if (id && server?.exitCode === null) await fetch(`${base}/${id}`, { method: 'DELETE' }).catch(() => {});
    if (server?.exitCode === null) await detener();
  }
});
