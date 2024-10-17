// routes/index.js

const express = require("express");
const router = express.Router();

// Importar las rutas individuales
const usuariosRoutes = require("./usuarios");
const mailRoutes = require("./mail");
const mailConfigRoutes = require("./mailConfig");
const cursosRoutes = require("./curso");
const estudiantesRoutes = require("./estudiante");
const pagoRoutes = require("./pago"); // Nueva ruta para pagos

// Usar las rutas importadas
router.use(usuariosRoutes); // Rutas para usuarios
router.use(mailRoutes); // Rutas para correos
router.use(mailConfigRoutes); // Rutas para configuración de correos
router.use(cursosRoutes); // Rutas para cursos
router.use(estudiantesRoutes); // Rutas para estudiantes
router.use(pagoRoutes); // Rutas para pagos

// Exportar el router unificado
module.exports = router;
