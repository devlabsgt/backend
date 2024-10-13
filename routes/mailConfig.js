const express = require("express");
const {
  obtenerConfiguracionCorreo,
  actualizarConfiguracionCorreo,
} = require("../controllers/mailConfigController"); // Importa los controladores
const router = express.Router();

router
  .get("/mail-config", obtenerConfiguracionCorreo) // Ruta para obtener la configuración de correo
  .put("/mail-config", actualizarConfiguracionCorreo); // Ruta para actualizar la configuración de correo (PUT)

module.exports = router;
