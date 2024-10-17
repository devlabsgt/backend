const express = require("express");
const router = express.Router();
const {
  crearEstudiante,
  obtenerEstudiantes,
  obtenerEstudiante,
  actualizarEstudiante,
  eliminarEstudiante,
  obtenerCursoAsignadoEstudiante,
} = require("../controllers/estudianteController");

// CRUD Estudiantes
router
  .route("/estudiantes")
  .post(crearEstudiante) // Crear un nuevo estudiante
  .get(obtenerEstudiantes); // Obtener todos los estudiantes

router
  .route("/estudiantes/:id")
  .get(obtenerEstudiante) // Obtener un estudiante por su ID
  .put(actualizarEstudiante) // Actualizar un estudiante por su ID
  .delete(eliminarEstudiante); // Eliminar un estudiante por su ID

// Obtener el curso asignado a un estudiante por su ID
router.get("/estudiantes/:id/curso", obtenerCursoAsignadoEstudiante);

module.exports = router;
