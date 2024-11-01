const express = require("express");
const router = express.Router();
const { Proyecto, Actividad } = require("../models/Proyecto");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const auth = require("../middleware/auth");
const vRol = require("../middleware/vRol");
// Configuración de la zona horaria de Guatemala
moment.tz.setDefault("America/Guatemala");

// Genera un código de 6 dígitos: 3 números y 3 letras
const generarCodigo = () => {
  const numeros = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  const letras = Array.from({ length: 3 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  return `${numeros}${letras}`;
};
// Middleware para actualizar el estado de los proyectos según la fecha final
const actualizarEstadoFechaFinal = async (req, res, next) => {
  try {
    const proyectos = await Proyecto.find({ estado: "Activo" });
    const ahora = moment();

    for (let proyecto of proyectos) {
      if (moment(proyecto.fechaFinal).isBefore(ahora)) {
        proyecto.estado = "Finalizado";
        await proyecto.save();
      }
    }
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al actualizar el estado de los proyectos" });
  }
};

/* Proyectos */

// Crear un nuevo proyecto
router.post("/proyecto", async (req, res) => {
  try {
    const proyecto = new Proyecto({
      ...req.body,
      codigo: generarCodigo(),
    });
    await proyecto.save();
    res.status(201).json(proyecto);
  } catch (error) {
    res.status(400).json({ message: "Error al crear el proyecto", error });
  }
});
// Obtener todos los proyectos
router.get("/proyecto", async (req, res) => {
  try {
    const proyectos = await Proyecto.find().populate(
      "encargado donantes.donante"
    );
    res.status(200).json(proyectos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los proyectos", error });
  }
});
// Obtener un proyecto por ID
router.get("/proyecto/:id", async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id).populate(
      "encargado donantes.donante"
    );
    if (!proyecto) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }
    res.status(200).json(proyecto);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el proyecto", error });
  }
});
// Actualizar solo los campos recibidos de un proyecto
router.put("/proyecto/:id", async (req, res) => {
  try {
    const actualizaciones = req.body; // Obtener solo los campos recibidos en req.body
    const proyecto = await Proyecto.findByIdAndUpdate(
      req.params.id,
      { $set: actualizaciones },
      { new: true }
    );
    if (!proyecto) {
      return res.status(404).json({ message: "Proyecto no encontrado" });
    }
    res.status(200).json(proyecto);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar el proyecto", error });
  }
});

/* Actividades */

// Crear una nueva actividad
router.post("/actividad", async (req, res) => {
  try {
    const actividad = new Actividad(req.body);
    await actividad.save();
    res.status(201).json(actividad);
  } catch (error) {
    res.status(400).json({ message: "Error al crear la actividad", error });
  }
});
// Obtener todas las actividades
router.get("/actividad", async (req, res) => {
  try {
    const actividades = await Actividad.find().populate(
      "proyecto beneficiario"
    );
    res.status(200).json(actividades);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al obtener las actividades", error });
  }
});
// Obtener una actividad por ID
router.get("/actividad/:id", async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.id).populate(
      "proyecto beneficiario"
    );
    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    res.status(200).json(actividad);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la actividad", error });
  }
});
// Actualizar solo los campos recibidos de una actividad
router.put("/actividad/:id", async (req, res) => {
  try {
    const actualizaciones = req.body; // Obtener solo los campos recibidos en req.body
    const actividad = await Actividad.findByIdAndUpdate(
      req.params.id,
      { $set: actualizaciones },
      { new: true }
    );
    if (!actividad) {
      return res.status(404).json({ message: "Actividad no encontrada" });
    }
    res.status(200).json(actividad);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al actualizar la actividad", error });
  }
});

module.exports = router;
