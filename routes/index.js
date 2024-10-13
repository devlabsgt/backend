const express = require("express");
const router = express.Router();

// Importar las rutas individuales
const usuariosRoutes = require("./usuarios");
const mailRoutes = require("./mail");
const mailConfigRoutes = require("./mailConfig");

// Usar las rutas importadas
router.use(usuariosRoutes); // Ruta para usuarios
router.use(mailRoutes); // Ruta para correos
router.use(mailConfigRoutes); // Rutas para la configuración de correos

// Exportar el router unificado
module.exports = router;
