const express = require("express");
const router = express.Router();
const {
  crearCurso,
  obtenerCursos,
  obtenerCurso,
  actualizarCurso,
  eliminarCurso,
  obtenerEstudiantesAsignadosCurso,
} = require("../controllers/cursoController");

// CRUD Cursos
router
  .route("/cursos")
  .post(crearCurso) // Crear un nuevo curso
  .get(obtenerCursos); // Obtener todos los cursos

router
  .route("/cursos/:id")
  .get(obtenerCurso) // Obtener un curso por su ID
  .put(actualizarCurso) // Actualizar un curso por su ID
  .delete(eliminarCurso); // Eliminar un curso por su ID

// Obtener los estudiantes asignados a un curso por su ID
router.get("/cursos/:id/estudiantes", obtenerEstudiantesAsignadosCurso);

module.exports = router;
