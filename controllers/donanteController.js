const Donante = require("../models/Donante");
const express = require("express");
const router = express.Router();
// const auth = require("../middleware/auth");
// const vRol = require("../middleware/vRol");

// Crear un nuevo donante
router.post(
  "/donante/crear",
  // auth,
  // vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      const donante = new Donante(req.body);
      await donante.save();
      res.status(201).json(donante);
    } catch (error) {
      console.error("Error al crear el donante:", error);
      res.status(500).json({
        mensaje: "Hubo un error al crear el donante",
        error: error.message,
      });
    }
  }
);

// Obtener todos los donantes
router.get(
  "/donante",
  // auth,
  // vRol(["Administrador", "Super", "Encargado"]),
  async (req, res) => {
    try {
      const donantes = await Donante.find();
      res.json(donantes);
    } catch (error) {
      console.error("Error al obtener los donantes:", error);
      res.status(500).json({
        mensaje: "Error al obtener los donantes",
        error: error.message,
      });
    }
  }
);

// Obtener un donante por su ID
router.get(
  "/donante/:id",
  // auth,
  // vRol(["Administrador", "Super", "Encargado"]),
  async (req, res) => {
    try {
      const donante = await Donante.findById(req.params.id);
      if (!donante) {
        return res.status(404).json({ mensaje: "Donante no encontrado" });
      }
      res.status(200).json(donante);
    } catch (error) {
      console.error("Error al obtener el donante:", error);
      res.status(500).json({
        mensaje: "Error al obtener el donante",
        error: error.message,
      });
    }
  }
);

// Actualizar un donante por su ID
router.put(
  "/donante/:id",
  // auth,
  // vRol(["Administrador", "Super"]),
  async (req, res) => {
    const { id } = req.params;
    const actualizaciones = req.body;

    try {
      const donante = await Donante.findByIdAndUpdate(
        id,
        { $set: actualizaciones },
        { new: true, runValidators: true }
      );

      if (!donante) {
        return res.status(404).json({
          mensaje: "Donante no encontrado",
          codigo: "DonanteNoEncontrado",
        });
      }

      res.status(200).json({
        mensaje: "Donante actualizado exitosamente",
        donante,
      });
    } catch (error) {
      console.error("Error al actualizar el donante:", error);
      res.status(500).json({
        mensaje: "Error al actualizar el donante",
        codigo: "ErrorActualizacion",
        error: error.message,
      });
    }
  }
);

// Eliminar un donante
router.delete(
  "/donante/:id",
  // auth,
  // vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      const donante = await Donante.findByIdAndDelete(req.params.id);

      if (!donante) {
        return res.status(404).json({
          mensaje: "Donante no encontrado",
          codigo: "DonanteNoEncontrado",
        });
      }

      res.status(200).json({
        mensaje: "Donante eliminado exitosamente",
        donante,
      });
    } catch (error) {
      console.error("Error al eliminar el donante:", error);
      res.status(500).json({
        mensaje: "Error al eliminar el donante",
        codigo: "ErrorEliminacion",
        error: error.message,
      });
    }
  }
);

module.exports = router;
