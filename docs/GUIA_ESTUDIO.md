# Preparación de la interrogación

Recorre el código y practica estas explicaciones con tus propias palabras.
Esta guía no reemplaza comprender ni modificar personalmente el proyecto.

1. **Recorrido de una solicitud.** `ticket-list.ts` llama a `TicketService`; HttpClient envía GET a `/api/tickets`. El proxy de desarrollo reenvía a Express y `tickets.routes.js` consulta MySQL con el pool de `db.js`.
2. **Responsabilidades.** Angular presenta y valida, Express valida y procesa operaciones, MySQL conserva la información. Explica por qué validar también en el servidor.
3. **Routing.** Localiza las rutas de listado, creación y edición en `app.routes.ts`, y cómo RouterOutlet muestra el componente correspondiente.
4. **Formularios.** Localiza FormBuilder, Validators, `markAllAsTouched()` y la selección entre POST y PUT en `ticket-form.ts`. Prueba ingresar espacios en un campo obligatorio.
5. **SQL parametrizado.** Explica para qué sirven los signos `?` y el arreglo de valores de `pool.execute()`, y por qué no concatenamos datos recibidos.
6. **Persistencia.** Los registros están en la tabla `tickets`, no solo en el navegador. Reinicia la API y vuelve a consultar un ticket.
7. **HTTP y errores.** Explica 200, 201, 204, 400, 404, 500 y 503 con ejemplos del proyecto. Ubica el middleware de errores y los mensajes de Angular.
8. **Fechas.** MySQL y el driver intercambian TIMESTAMP en UTC. DatePipe muestra la fecha en la zona horaria del navegador.
9. **Credenciales.** `.env` contiene datos locales y no se versiona. `.env.example` permite conocer las variables requeridas. El usuario de la aplicación tiene permisos CRUD, sin permisos de administración.
10. **Pruebas.** Lee `backend/test/tickets.test.js`: explica cómo se levanta la API, se verifica el CRUD, se reinicia para verificar persistencia y se limpia el ticket temporal.

Ejercicios: cambia una validación y comprueba su efecto; explica cómo agregar un campo en SQL, API y formulario; apaga la API y analiza la respuesta de la interfaz.

Para preparar otro equipo: instala las dependencias con `npm run install:all`, copia `backend/.env.example` a `backend/.env`, completa la credencial administrativa de MySQL y ejecuta `npm run db:setup`. MySQL debe estar instalado y ejecutándose. El script crea la base, la tabla y el usuario local, comprueba la conexión y elimina MYSQL_ADMIN_PASSWORD del archivo al finalizar correctamente. Si el usuario ya existe, conserva su contraseña: configura DB_PASSWORD con su clave actual.

Inicia Angular con `npm start` y Express con `npm run backend` en terminales separadas. El proxy configurado se aplica al servidor de desarrollo Angular. La publicación en un servidor requiere configurar el reenvío de `/api`.

El README y la declaración específica del uso de IA quedan a cargo del autor. Antes de entregar, revisa el código, realiza adaptaciones propias y describe con precisión lo que verificaste personalmente.
