const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const usuariosRoutes = require("./routes/usuarios.routes");
const { rutaNoEncontrada, manejadorErrores } = require("./middlewares/errores");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    mensaje: "API REST de pre-registro de estudiantes UNEMI",
    endpoints: {
      registrar: "POST /usuarios",
      listar: "GET /usuarios",
      consultarPorId: "GET /usuarios/:id",
      actualizar: "PUT /usuarios/:id",
      eliminar: "DELETE /usuarios/:id",
    },
  });
});

app.use("/usuarios", usuariosRoutes);

app.use(rutaNoEncontrada);
app.use(manejadorErrores);

// Verifica la conexión a PostgreSQL antes de levantar el servidor
pool
  .query("SELECT NOW()")
  .then(() => {
    console.log("Conectado a PostgreSQL");
    app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("No se pudo conectar a PostgreSQL:", err.message);
    process.exit(1);
  });
