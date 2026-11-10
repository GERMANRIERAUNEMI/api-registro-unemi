# API REST de Pre-registro de Estudiantes UNEMI — Node.js + Express + PostgreSQL

Proyecto académico de la asignatura **Desarrollo Web** (Práctica N.º 3), Carrera de Ingeniería de Software, Universidad Estatal de Milagro (UNEMI).

## Descripción

API REST que gestiona el pre-registro de estudiantes. Usa los mismos datos del formulario de pre-registro desarrollado en las prácticas anteriores ([Formulario de pre-registro](https://github.com/GERMANRIERAUNEMI/Formulario-de-pre-registro)), ahora almacenados en una base de datos relacional **PostgreSQL** y expuestos mediante operaciones **CRUD**. El funcionamiento se comprueba con **Postman**.

## Tecnologías utilizadas

- **Node.js**: entorno de ejecución de JavaScript del lado del servidor.
- **Express**: framework para crear el servidor, las rutas y los controladores.
- **PostgreSQL**: base de datos relacional.
- **pg**: conexión entre Node.js y PostgreSQL.
- **bcryptjs**: cifrado de contraseñas antes de guardarlas.
- **dotenv**: variables de entorno para las credenciales.
- **cors**: permite consumir la API desde un frontend.
- **nodemon**: reinicio automático en desarrollo.
- **Postman**: pruebas de los endpoints.

## Estructura del proyecto

```text
api-registro-unemi/
├── database/
│   └── script.sql                  # Creación de la tabla usuarios
├── postman/
│   └── API-Preregistro-UNEMI.postman_collection.json
├── src/
│   ├── app.js                      # Servidor Express
│   ├── config/db.js                # Conexión a PostgreSQL
│   ├── controllers/usuarios.controller.js   # Lógica CRUD
│   ├── routes/usuarios.routes.js   # Rutas /usuarios
│   ├── validators/usuario.validator.js      # Validaciones del registro
│   └── middlewares/errores.js      # Ruta no encontrada y JSON inválido
├── .env.example
├── .gitignore
└── package.json
```

## Base de datos

Tabla `usuarios`, basada en los campos del formulario de pre-registro:

| Campo | Tipo | Restricción |
| --- | --- | --- |
| id | SERIAL | Clave primaria |
| nombre | VARCHAR(60) | Obligatorio |
| correo | VARCHAR(120) | Obligatorio, único |
| password_hash | VARCHAR(100) | Contraseña cifrada con bcrypt |
| edad | SMALLINT | Entre 16 y 99 |
| telefono | CHAR(10) | Obligatorio |
| carrera | VARCHAR(30) | software, ti, industrial, administracion, educacion |
| fecha_nacimiento | DATE | Obligatorio |
| modalidad | VARCHAR(15) | presencial, en-linea, hibrida |
| comentarios | VARCHAR(200) | Opcional |
| terminos | BOOLEAN | Aceptación de términos |
| fecha_registro | TIMESTAMP | Automático |
| fecha_actualizacion | TIMESTAMP | Se llena al actualizar |

## Instalación y ejecución

1. Clonar el repositorio e instalar dependencias:
   ```bash
   git clone <url-del-repositorio>
   cd api-registro-unemi
   npm install
   ```
2. Crear la base de datos `registro_unemi` en PostgreSQL (pgAdmin o psql).
3. Abrir el Query Tool sobre `registro_unemi` y ejecutar `database/script.sql`.
4. Copiar `.env.example` como `.env` y colocar la contraseña de PostgreSQL.
5. Iniciar el servidor:
   ```bash
   npm run dev     # desarrollo (nodemon)
   npm start       # normal
   ```
6. La API queda disponible en `http://localhost:3000`.

## Endpoints

| Método | Ruta | Acción | Respuestas |
| --- | --- | --- | --- |
| POST | /usuarios | Registrar usuario | 201, 400, 409 |
| GET | /usuarios | Listar usuarios | 200 |
| GET | /usuarios/:id | Consultar por ID | 200, 400, 404 |
| PUT | /usuarios/:id | Actualizar (solo campos enviados) | 200, 400, 404, 409 |
| DELETE | /usuarios/:id | Eliminar usuario | 200, 400, 404 |

Ejemplo de cuerpo para `POST /usuarios`:

```json
{
  "nombre": "German Riera",
  "correo": "german@unemi.edu.ec",
  "password": "Clave1234",
  "confirmar": "Clave1234",
  "edad": 22,
  "telefono": "0991234567",
  "carrera": "software",
  "fecha_nacimiento": "2004-03-15",
  "modalidad": "presencial",
  "comentarios": "Interesado en la carrera",
  "terminos": true
}
```

## Funcionalidades implementadas

- CRUD completo de usuarios conectado a PostgreSQL.
- Validaciones del formulario de pre-registro aplicadas en el servidor:
  - Nombre: solo letras, 3 a 60 caracteres, nombre y apellido.
  - Correo: formato válido, sin puntos consecutivos y sin duplicados.
  - Contraseña: mínimo 8 caracteres, mayúscula, minúscula, número, sin espacios y confirmación.
  - Edad entre 16 y 99, coherente con la fecha de nacimiento.
  - Teléfono de 10 dígitos que inicia con 09.
  - Carrera y modalidad dentro de las opciones permitidas.
  - Comentarios opcionales de máximo 200 caracteres.
  - Aceptación obligatoria de términos.
- Contraseñas cifradas con bcrypt; nunca se devuelven en las respuestas.
- Actualización parcial: solo se modifican los campos enviados.
- Respuestas HTTP adecuadas: 200, 201, 400, 404, 409 y 500, con mensajes en JSON.
- Manejo de JSON mal formado y de rutas inexistentes.

## Pruebas con Postman

Importar `postman/API-Preregistro-UNEMI.postman_collection.json` en Postman. Incluye casos exitosos y casos de error para cada endpoint. La variable `baseUrl` apunta a `http://localhost:3000`.
