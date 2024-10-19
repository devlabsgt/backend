const express = require("express");
const {
  crearAvance,
  obtenerAvances,
  obtenerAvance,
  actualizarAvance,
  eliminarAvance,
} = require("../controllers/avanceController");
const router = express.Router();

// Definir las rutas con sus controladores
router
  .post("/avance/:usuarioId", crearAvance) // Crear nuevo avance para un usuario
  .get("/avances/:usuarioId", obtenerAvances) // Obtener todos los avances de un usuario
  .get("/avance/:usuarioId/:avanceId", obtenerAvance) // Obtener un avance específico de un usuario
  .put("/avance/:usuarioId/:avanceId", actualizarAvance) // Actualizar un avance de un usuario
  .delete("/avance/:usuarioId/:avanceId", eliminarAvance); // Eliminar un avance de un usuario

module.exports = router;
