// Ruta no encontrada
const rutaNoEncontrada = (req, res) => {
  res.status(404).json({ ok: false, mensaje: `Ruta ${req.method} ${req.originalUrl} no encontrada.` });
};

// JSON mal formado u otros errores no controlados
// eslint-disable-next-line no-unused-vars
const manejadorErrores = (err, req, res, next) => {
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ ok: false, mensaje: "El cuerpo de la petición no es un JSON válido." });
  }
  console.error(err);
  return res.status(500).json({ ok: false, mensaje: "Error interno del servidor." });
};

module.exports = { rutaNoEncontrada, manejadorErrores };
