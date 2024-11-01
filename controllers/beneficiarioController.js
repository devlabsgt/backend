const Beneficiario = require("../models/Beneficiario");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const vRol = require("../middleware/vRol");
// Crear un nuevo beneficiario
router.post(
  "/beneficiario/crear",
  auth,
  vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      const beneficiario = new Beneficiario(req.body); // Crear un nuevo beneficiario con los datos del request
      await beneficiario.save(); // Guardar en la base de datos
      res.status(201).json(beneficiario); // Enviar la respuesta con el beneficiario creado
    } catch (error) {
      console.error("Error al crear el beneficiario:", error);
      res
        .status(500)
        .json({ mensaje: "Hubo un error al crear el beneficiario" });
    }
  }
);
// Obtener todos los beneficiarios activos
router.get(
  "/beneficiario",
  auth,
  vRol(["Administrador", "Super", "Encargado"]),
  async (req, res) => {
    try {
      const beneficiarios = await Beneficiario.find().populate("proyecto"); // Filtramos por activo: true
      res.json(beneficiarios);
    } catch (error) {
      console.error("Error al obtener los beneficiarios:", error);
      res.status(500).json({ message: "Error al obtener los beneficiarios" });
    }
  }
);
// Obtener un beneficiario por su ID
router.get(
  "/beneficiario/:id",
  auth,
  vRol(["Administrador", "Super", "Encargado"]),
  async (req, res) => {
    try {
      const beneficiario = await Beneficiario.findById(req.params.id).populate(
        "cursoAsignado"
      ); // Buscar el beneficiario por ID
      if (!beneficiario) {
        return res.status(404).json({ mensaje: "Beneficiario no encontrado" });
      }
      res.status(200).json(beneficiario); // Enviar la respuesta con el beneficiario
    } catch (error) {
      console.error("Error al obtener el beneficiario:", error);
      res
        .status(500)
        .json({ mensaje: "Hubo un error al obtener el beneficiario" });
    }
  }
);
// Actualizar un beneficiario por su ID (incluye actualizar los cursos asignados)
router.put(
  "/beneficiario/:id",
  auth,
  vRol(["Administrador", "Super"]),
  async (req, res) => {
    const { id } = req.params;
    const actualizaciones = req.body; // Obtener solo los campos recibidos en req.body

    try {
      // Actualizar solo los campos proporcionados
      const beneficiario = await Beneficiario.findByIdAndUpdate(
        id,
        { $set: actualizaciones },
        { new: true, runValidators: true }
      ).populate("proyecto");

      if (!beneficiario) {
        return res.status(404).json({
          mensaje: "Beneficiario no encontrado",
          codigo: "BeneficiarioNoEncontrado",
        });
      }

      res.status(200).json({
        mensaje: "Beneficiario actualizado exitosamente",
        beneficiario,
      }); // Enviar la respuesta con el beneficiario actualizado
    } catch (error) {
      console.error("Error al actualizar el beneficiario:", error);
      res.status(500).json({
        mensaje: "Hubo un error al actualizar el beneficiario",
        codigo: "ErrorActualizacion",
        detalles: error.message,
      });
    }
  }
);

module.exports = router;
