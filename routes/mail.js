const express = require("express");
const {
  enviarLinkRecuperacion,
  enviarMensaje,
  enviarMensajeBienvenida,
} = require("../controllers/mailController");
const router = express.Router();

// Definir las rutas con sus controladores
router
  .post("/link-recuperarcion", enviarLinkRecuperacion)
  .post("/enviar-mensaje", enviarMensaje)
  .post("/enviar-bienvenida", enviarMensajeBienvenida);

module.exports = router;
