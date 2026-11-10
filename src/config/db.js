const { Pool, types } = require("pg");
require("dotenv").config();

// Las columnas DATE se devuelven como texto "AAAA-MM-DD" (sin desfase de zona horaria)
types.setTypeParser(1082, (valor) => valor);

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
