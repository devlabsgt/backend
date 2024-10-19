const express = require("express");
const router = express.Router();

// Importar las rutas individuales
const usuariosRoutes = require("./usuarios");
const mailRoutes = require("./mail");
const mailConfigRoutes = require("./mailConfig");
const avanceRoutes = require("./avance"); // Rutas para los avances antropométricos

// Usar las rutas importadas
router.use(usuariosRoutes); // Ruta para usuarios
router.use(mailRoutes); // Ruta para correos
router.use(mailConfigRoutes); // Rutas para la configuración de correos
router.use(avanceRoutes); // Rutas para avances antropométricos

// Exportar el router unificado
module.exports = router;
