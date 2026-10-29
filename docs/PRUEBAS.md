# Verificaciones realizadas

Fecha: 28 de octubre de 2026. Entorno local: Node.js 26, Angular 22 y MySQL.

## Pruebas automáticas

Ejecutar `npm --prefix backend test` con MySQL configurado y disponible.
La prueba crea su propio ticket y lo elimina al terminar; no borra tickets existentes.

- CRUD mediante HTTP: POST 201, GET 200, PUT 200 y DELETE 204.
- Actualización sin cambios: 200.
- Ticket inexistente: 404.
- Datos obligatorios, prioridad inválida, asunto demasiado largo e ID inválido: 400.
- JSON mal formado: 400.
- Persistencia: el estado editado sigue disponible al reiniciar la API.
- Fecha: el registro corresponde al instante actual, con intercambio en UTC.
- MySQL inaccesible: health 503 y operaciones 500 con mensaje genérico.

Compilación Angular verificada con `npm run build`.
Preparación de la base y permisos verificada con `npm run db:setup`.

## Verificaciones manuales en Chrome

- El formulario vacío muestra errores y evita enviar el registro.
- Crear ticket: vuelve al listado y muestra los datos guardados.
- Editar asunto: el listado muestra el cambio y lo conserva al recargar.
- El botón Eliminar solicita confirmación; cancelar conserva el registro.
- La eliminación efectiva se comprobó por HTTP y en las pruebas automáticas.
- Con la API apagada se muestra un mensaje de comunicación fallida.
- Al reiniciar la API, Actualizar listado recupera los registros.
- Revisión visual de escritorio: tema oscuro, botones naranja y estados diferenciados.

La eliminación confirmada desde el diálogo y la visualización en un teléfono real no se verificaron manualmente.
El repositorio fue consultado sin autenticación mediante la API de GitHub y es público.
