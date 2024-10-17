// controllers/pagoController.js

const mongoose = require("mongoose");
const Pago = require("../models/Pago");
// Crear un nuevo pago
exports.crearPago = async (req, res) => {
  try {
    const { estudiante, curso, monto, mes } = req.body;

    // Crear un nuevo pago
    const nuevoPago = new Pago({
      estudiante,
      curso,
      monto,
      mes,
    });

    // Guardar el pago en la base de datos
    const pagoGuardado = await nuevoPago.save();
    res.status(201).json(pagoGuardado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al crear el pago" });
  }
};

// Obtener todos los pagos o los pagos de un estudiante específico
exports.obtenerPagos = async (req, res) => {
  try {
    const { estudianteId, estudianteID } = req.query;

    // Determinar el filtro a usar en función del parámetro disponible
    const filtro =
      estudianteId || estudianteID
        ? { estudiante: estudianteId || estudianteID }
        : {};

    // Buscar los pagos con el filtro especificado
    const pagos = await Pago.find(filtro)
      .populate("estudiante", "nombre")
      .populate("curso", "curso");

    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener los pagos" });
  }
};

// Obtener un pago por su ID
exports.obtenerPago = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar el pago por su ID
    const pago = await Pago.findById(id)
      .populate("estudiante", "nombre")
      .populate("curso", "curso");

    if (!pago) {
      return res.status(404).json({ msg: "Pago no encontrado" });
    }

    res.status(200).json(pago);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener el pago" });
  }
};

// Actualizar un pago
exports.actualizarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, mes } = req.body;

    // Actualizar el pago
    const pagoActualizado = await Pago.findByIdAndUpdate(
      id,
      { monto, mes },
      { new: true }
    );

    if (!pagoActualizado) {
      return res.status(404).json({ msg: "Pago no encontrado" });
    }

    res.status(200).json(pagoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar el pago" });
  }
};

// Eliminar un pago
exports.eliminarPago = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ msg: "ID del pago no es válido" });
    }

    // Eliminar el pago
    const pagoEliminado = await Pago.findByIdAndDelete(id);

    if (!pagoEliminado) {
      return res.status(404).json({ msg: "Pago no encontrado" });
    }

    res.status(200).json({ msg: "Pago eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el pago:", error);
    res.status(500).json({ msg: "Error al eliminar el pago" });
  }
};

// Obtener pagos por estudiante y curso
exports.obtenerPagosCursoEstudiante = async (req, res) => {
  try {
    const { idEstudiante, idCurso } = req.params;

    // Buscar los pagos realizados por el estudiante en el curso especificado
    const pagos = await Pago.find({ estudiante: idEstudiante, curso: idCurso })
      .populate("estudiante", "nombre")
      .populate("curso", "curso");

    if (!pagos) {
      return res.status(404).json({
        msg: "No se encontraron pagos para este estudiante en el curso especificado",
      });
    }

    res.status(200).json(pagos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al obtener los pagos" });
  }
};
