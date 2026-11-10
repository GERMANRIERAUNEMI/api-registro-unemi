const bcrypt = require("bcryptjs");
const pool = require("../config/db");
const {
  validarRegistro,
  validarActualizacion,
  CAMPOS_EDITABLES,
} = require("../validators/usuario.validator");

// Columnas que se devuelven al cliente (la contraseña nunca se expone)
const COLUMNAS = `id, nombre, correo, edad, telefono, carrera, fecha_nacimiento,
  modalidad, comentarios, terminos, fecha_registro, fecha_actualizacion`;

const limpiarNombre = (n) => n.trim().replace(/\s+/g, " ");

function idValido(id) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0;
}

// Traduce errores de PostgreSQL a respuestas HTTP
function manejarErrorBD(error, res) {
  if (error.code === "23505") {
    return res.status(409).json({
      ok: false,
      mensaje: "El correo ya está registrado.",
      errores: { correo: "Este correo ya existe." },
    });
  }
  if (error.code === "23514") {
    return res.status(400).json({ ok: false, mensaje: "Datos fuera de los valores permitidos." });
  }
  console.error(error);
  return res.status(500).json({ ok: false, mensaje: "Error interno del servidor." });
}

// POST /usuarios → Registrar
const crearUsuario = async (req, res) => {
  const datos = req.body || {};
  const errores = validarRegistro(datos);
  if (Object.keys(errores).length) {
    return res.status(400).json({ ok: false, mensaje: "Datos inválidos.", errores });
  }

  try {
    const hash = await bcrypt.hash(datos.password, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios
        (nombre, correo, password_hash, edad, telefono, carrera, fecha_nacimiento, modalidad, comentarios, terminos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${COLUMNAS}`,
      [
        limpiarNombre(datos.nombre),
        datos.correo.trim().toLowerCase(),
        hash,
        Number(datos.edad),
        String(datos.telefono),
        datos.carrera,
        datos.fecha_nacimiento,
        datos.modalidad,
        (datos.comentarios || "").trim(),
        true,
      ]
    );
    return res.status(201).json({ ok: true, mensaje: "Usuario registrado correctamente.", data: rows[0] });
  } catch (error) {
    return manejarErrorBD(error, res);
  }
};

// GET /usuarios → Consultar todos
const obtenerUsuarios = async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM usuarios ORDER BY id`);
    return res.status(200).json({ ok: true, total: rows.length, data: rows });
  } catch (error) {
    return manejarErrorBD(error, res);
  }
};

// GET /usuarios/:id → Consultar por ID
const obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) {
    return res.status(400).json({ ok: false, mensaje: "El ID debe ser un número entero positivo." });
  }
  try {
    const { rows } = await pool.query(`SELECT ${COLUMNAS} FROM usuarios WHERE id = $1`, [id]);
    if (!rows.length) {
      return res.status(404).json({ ok: false, mensaje: `No existe un usuario con ID ${id}.` });
    }
    return res.status(200).json({ ok: true, data: rows[0] });
  } catch (error) {
    return manejarErrorBD(error, res);
  }
};

// PUT /usuarios/:id → Actualizar (solo los campos enviados)
const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) {
    return res.status(400).json({ ok: false, mensaje: "El ID debe ser un número entero positivo." });
  }

  const enviados = {};
  CAMPOS_EDITABLES.forEach((c) => {
    if (req.body && req.body[c] !== undefined) enviados[c] = req.body[c];
  });
  if (!Object.keys(enviados).length) {
    return res.status(400).json({
      ok: false,
      mensaje: `Envíe al menos un campo para actualizar: ${CAMPOS_EDITABLES.filter((c) => c !== "confirmar").join(", ")}.`,
    });
  }

  try {
    const actual = await pool.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    if (!actual.rows.length) {
      return res.status(404).json({ ok: false, mensaje: `No existe un usuario con ID ${id}.` });
    }

    const combinado = { ...actual.rows[0], ...enviados };
    const errores = validarActualizacion(enviados, combinado);
    if (Object.keys(errores).length) {
      return res.status(400).json({ ok: false, mensaje: "Datos inválidos.", errores });
    }

    // Construcción dinámica del UPDATE
    const valores = [];
    const sets = [];
    const agregar = (columna, valor) => {
      valores.push(valor);
      sets.push(`${columna} = $${valores.length}`);
    };

    if (enviados.nombre !== undefined) agregar("nombre", limpiarNombre(enviados.nombre));
    if (enviados.correo !== undefined) agregar("correo", enviados.correo.trim().toLowerCase());
    if (enviados.password !== undefined) agregar("password_hash", await bcrypt.hash(enviados.password, 10));
    if (enviados.edad !== undefined) agregar("edad", Number(enviados.edad));
    if (enviados.telefono !== undefined) agregar("telefono", String(enviados.telefono));
    if (enviados.carrera !== undefined) agregar("carrera", enviados.carrera);
    if (enviados.fecha_nacimiento !== undefined) agregar("fecha_nacimiento", enviados.fecha_nacimiento);
    if (enviados.modalidad !== undefined) agregar("modalidad", enviados.modalidad);
    if (enviados.comentarios !== undefined) agregar("comentarios", enviados.comentarios.trim());
    sets.push("fecha_actualizacion = NOW()");

    valores.push(id);
    const { rows } = await pool.query(
      `UPDATE usuarios SET ${sets.join(", ")} WHERE id = $${valores.length} RETURNING ${COLUMNAS}`,
      valores
    );
    return res.status(200).json({ ok: true, mensaje: "Usuario actualizado correctamente.", data: rows[0] });
  } catch (error) {
    return manejarErrorBD(error, res);
  }
};

// DELETE /usuarios/:id → Eliminar
const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  if (!idValido(id)) {
    return res.status(400).json({ ok: false, mensaje: "El ID debe ser un número entero positivo." });
  }
  try {
    const { rows } = await pool.query(`DELETE FROM usuarios WHERE id = $1 RETURNING ${COLUMNAS}`, [id]);
    if (!rows.length) {
      return res.status(404).json({ ok: false, mensaje: `No existe un usuario con ID ${id}.` });
    }
    return res.status(200).json({ ok: true, mensaje: "Usuario eliminado correctamente.", data: rows[0] });
  } catch (error) {
    return manejarErrorBD(error, res);
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
};
