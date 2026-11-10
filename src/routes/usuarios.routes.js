const { Router } = require("express");
const {
  crearUsuario,
  obtenerUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  eliminarUsuario,
} = require("../controllers/usuarios.controller");

const router = Router();

router.post("/", crearUsuario);
router.get("/", obtenerUsuarios);
router.get("/:id", obtenerUsuarioPorId);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);

module.exports = router;
