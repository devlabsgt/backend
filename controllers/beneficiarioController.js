const { Beneficiario, Direccion } = require("../models/Beneficiario");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const vRol = require("../middleware/vRol");

// Crear un nuevo beneficiario junto con su dirección// Crear un nuevo beneficiario junto con su dirección
router.post(
  "/beneficiario",
  auth,
  vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      // Extrae los datos de dirección del cuerpo de la solicitud
      const direccionData = req.body.direccion;

      // Crea y guarda el documento de dirección
      const nuevaDireccion = new Direccion(direccionData);
      await nuevaDireccion.save();

      // Crea el documento de beneficiario usando la dirección recién creada
      const beneficiarioData = { ...req.body, direccion: nuevaDireccion._id };
      delete beneficiarioData.departamento; // Asegura que no se pase `departamento` ni `municipio`
      delete beneficiarioData.municipio;

      const beneficiario = new Beneficiario(beneficiarioData);
      await beneficiario.save();

      res.status(201).json(beneficiario);
    } catch (error) {
      console.error("Error al crear el beneficiario:", error);
      res
        .status(500)
        .json({ mensaje: "Hubo un error al crear el beneficiario" });
    }
  }
);

// Obtener todas las localidades filtradas por departamento y municipio
router.get("/localidades", auth, async (req, res) => {
  try {
    const { departamento, municipio } = req.query;
    const localidades = await Direccion.find({
      departamento: departamento,
      municipio: municipio,
    }).select("loacalidad");

    res.status(200).json(localidades);
  } catch (error) {
    console.error("Error al obtener las localidades:", error);
    res.status(500).json({ message: "Error al obtener las localidades" });
  }
});

// Obtener todos los beneficiarios activos con su dirección y proyecto
router.get("/beneficiario", auth, async (req, res) => {
  try {
    const beneficiarios = await Beneficiario.find()
      .populate("direccion")
      .populate("Proyecto");
    res.json(beneficiarios);
  } catch (error) {
    console.error("Error al obtener los beneficiarios:", error);
    res.status(500).json({ message: "Error al obtener los beneficiarios" });
  }
});

// Obtener un beneficiario por su ID con dirección y proyecto
router.get("/beneficiario/:id", auth, async (req, res) => {
  try {
    const beneficiario = await Beneficiario.findById(req.params.id)
      .populate("direccion")
      .populate("Proyecto");

    if (!beneficiario) {
      return res.status(404).json({ mensaje: "Beneficiario no encontrado" });
    }
    res.status(200).json(beneficiario);
  } catch (error) {
    console.error("Error al obtener el beneficiario:", error);
    res
      .status(500)
      .json({ mensaje: "Hubo un error al obtener el beneficiario" });
  }
});

// Actualizar un beneficiario por su ID (incluye actualización de dirección)
router.put(
  "/beneficiario/:id",
  auth,
  vRol(["Administrador", "Super"]),
  async (req, res) => {
    const { id } = req.params;
    const { direccion, ...beneficiarioData } = req.body;

    try {
      const beneficiario = await Beneficiario.findByIdAndUpdate(
        id,
        { $set: beneficiarioData },
        { new: true, runValidators: true }
      )
        .populate("Proyecto")
        .populate("direccion");

      if (!beneficiario) {
        return res.status(404).json({ mensaje: "Beneficiario no encontrado" });
      }

      if (direccion) {
        await Direccion.findByIdAndUpdate(beneficiario.direccion, {
          $set: direccion,
        });
      }

      res.status(200).json({
        mensaje: "Beneficiario y dirección actualizados exitosamente",
        beneficiario,
      });
    } catch (error) {
      console.error("Error al actualizar el beneficiario:", error);
      res.status(500).json({
        mensaje: "Hubo un error al actualizar el beneficiario",
        detalles: error.message,
      });
    }
  }
);

module.exports = router;
