// Validaciones del registro (mismas reglas del formulario de pre-registro de la Práctica 2)

const CARRERAS = ["software", "ti", "industrial", "administracion", "educacion"];
const MODALIDADES = ["presencial", "en-linea", "hibrida"];
const MAX_COMENTARIOS = 200;
const FECHA_MINIMA = "1927-01-01";

const regex = {
  nombre: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]+$/,
  correo: /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/,
  telefono: /^09\d{8}$/,
  fecha: /^\d{4}-\d{2}-\d{2}$/,
};

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function calcularEdad(fechaISO) {
  const nacimiento = new Date(fechaISO + "T00:00:00");
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
}

const validadores = {
  nombre(v) {
    if (typeof v !== "string" || !v.trim()) return "El nombre es obligatorio.";
    const limpio = v.trim().replace(/\s+/g, " ");
    if (limpio.length < 3) return "Debe tener al menos 3 caracteres.";
    if (!regex.nombre.test(limpio)) return "Solo se permiten letras y espacios.";
    if (limpio.split(" ").length < 2) return "Ingresa nombre y apellido.";
    if (limpio.length > 60) return "Máximo 60 caracteres.";
    return "";
  },

  correo(v) {
    if (typeof v !== "string" || !v.trim()) return "El correo es obligatorio.";
    const limpio = v.trim();
    if (!regex.correo.test(limpio)) return "Formato inválido (ej: usuario@dominio.com).";
    if (limpio.includes("..")) return "El correo no puede tener dos puntos seguidos.";
    return "";
  },

  password(v) {
    if (typeof v !== "string" || !v) return "La contraseña es obligatoria.";
    if (/\s/.test(v)) return "La contraseña no puede contener espacios.";
    if (v.length < 8) return "Mínimo 8 caracteres.";
    if (!/[A-Z]/.test(v)) return "Debe incluir al menos una letra mayúscula.";
    if (!/[a-z]/.test(v)) return "Debe incluir al menos una letra minúscula.";
    if (!/[0-9]/.test(v)) return "Debe incluir al menos un número.";
    return "";
  },

  confirmar(v, datos) {
    if (!v) return "Confirma la contraseña.";
    if (v !== datos.password) return "Las contraseñas no coinciden.";
    return "";
  },

  edad(v) {
    if (v === undefined || v === null || v === "") return "La edad es obligatoria.";
    const n = Number(v);
    if (!Number.isInteger(n)) return "La edad debe ser un número entero.";
    if (n < 16 || n > 99) return "La edad debe estar entre 16 y 99 años.";
    return "";
  },

  telefono(v) {
    if (v === undefined || v === null || v === "") return "El teléfono es obligatorio.";
    const s = String(v);
    if (!/^\d+$/.test(s)) return "Solo se permiten números.";
    if (!regex.telefono.test(s)) return "Debe tener 10 dígitos y empezar con 09.";
    return "";
  },

  carrera(v) {
    if (!v) return "La carrera es obligatoria.";
    if (!CARRERAS.includes(v)) return `Carrera inválida. Opciones: ${CARRERAS.join(", ")}.`;
    return "";
  },

  fecha_nacimiento(v, datos) {
    if (!v) return "La fecha de nacimiento es obligatoria.";
    if (!regex.fecha.test(v) || isNaN(new Date(v + "T00:00:00"))) return "Formato de fecha inválido (AAAA-MM-DD).";
    if (v < FECHA_MINIMA) return "Ingresa una fecha válida.";
    if (v > hoyISO()) return "La fecha no puede ser futura.";
    const edadCalculada = calcularEdad(v);
    if (edadCalculada < 16) return "Debe tener al menos 16 años.";
    if (datos.edad !== undefined && datos.edad !== "" && edadCalculada !== Number(datos.edad)) {
      return `No coincide con la edad ingresada (según la fecha tendría ${edadCalculada}).`;
    }
    return "";
  },

  modalidad(v) {
    if (!v) return "La modalidad es obligatoria.";
    if (!MODALIDADES.includes(v)) return `Modalidad inválida. Opciones: ${MODALIDADES.join(", ")}.`;
    return "";
  },

  comentarios(v) {
    if (v === undefined || v === null) return "";
    if (typeof v !== "string") return "Los comentarios deben ser texto.";
    if (v.length > MAX_COMENTARIOS) return `Máximo ${MAX_COMENTARIOS} caracteres.`;
    return "";
  },

  terminos(v) {
    return v === true ? "" : "Debe aceptar los términos y condiciones.";
  },
};

// Registro (POST): valida todos los campos
function validarRegistro(datos) {
  const errores = {};
  Object.keys(validadores).forEach((campo) => {
    const error = validadores[campo](datos[campo], datos);
    if (error) errores[campo] = error;
  });
  return errores;
}

// Actualización (PUT): valida solo los campos enviados.
// "datos" ya viene combinado con el registro actual para validar edad vs. fecha.
function validarActualizacion(enviados, datos) {
  const errores = {};
  const campos = Object.keys(validadores).filter(
    (c) => c !== "terminos" && c !== "confirmar" && enviados[c] !== undefined
  );
  if (enviados.password !== undefined) campos.push("confirmar");
  if (enviados.edad !== undefined && !campos.includes("fecha_nacimiento")) campos.push("fecha_nacimiento");
  if (enviados.fecha_nacimiento !== undefined && !campos.includes("edad")) campos.push("edad");

  campos.forEach((campo) => {
    const error = validadores[campo](datos[campo], datos);
    if (error) errores[campo] = error;
  });
  return errores;
}

const CAMPOS_EDITABLES = [
  "nombre", "correo", "password", "confirmar", "edad", "telefono",
  "carrera", "fecha_nacimiento", "modalidad", "comentarios",
];

module.exports = { validarRegistro, validarActualizacion, CAMPOS_EDITABLES };
