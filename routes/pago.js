// routes/pago.js

const express = require("express");
const router = express.Router();
const {
  crearPago,
  obtenerPagos,
  obtenerPago,
  actualizarPago,
  eliminarPago,
  obtenerPagosCursoEstudiante,
} = require("../controllers/pagoController");

// CRUD Pagos
router
  .route("/pagos")
  .post(crearPago) // Crear un nuevo pago
  .get(obtenerPagos); // Obtener todos los pagos o filtrar por estudiante

router
  .route("/pagos/:id")
  .get(obtenerPago) // Obtener un pago por su ID
  .put(actualizarPago) // Actualizar un pago por su ID
  .delete(eliminarPago); // Eliminar un pago por su ID

// Nueva ruta para obtener los pagos de un estudiante en un curso específico
router.route("/pagos/:idEstudiante/:idCurso").get(obtenerPagosCursoEstudiante); // Obtener pagos por estudiante y curso

module.exports = router;
