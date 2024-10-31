const express = require("express");
const router = express.Router();

// Importar las rutas individuales
const { router: usuarioRoutes } = require("../controllers/usuariosController"); // Solo el router
const proyectoRoutes = require("../controllers/proyectoController"); // Rutas de proyectos
const beneficiarioRoutes = require("../controllers/beneficiarioController"); // Rutas de beneficiarios

// Usa las rutas importadas sin prefijos
router.use(usuarioRoutes);
router.use(proyectoRoutes);
router.use(beneficiarioRoutes);

// Exporta el router unificado
module.exports = router;
