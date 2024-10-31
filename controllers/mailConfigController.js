const express = require("express");
const router = express.Router();
const MailConfig = require("../models/MailConfig");

// Función para inicializar una configuración predefinida si no existe
const crearConfiguracionCorreoPorDefecto = async () => {
  try {
    const config = await MailConfig.findOne();
    if (!config) {
      await MailConfig.create({
        emailSender: "default@correo.com",
        emailPassword: "defaultpass",
        smtpHost: "smtp.default.com",
        smtpPort: 465,
        telefono: "50242140797",
        defaultPassword: "devlabsgt",
      });
    }
  } catch (error) {
    console.error(
      "Error al crear la configuración de correo por defecto:",
      error
    );
  }
};

// Obtener la configuración de correo
router.get("/correo/configuracion", async (req, res) => {
  try {
    const config = await MailConfig.findOne();
    if (!config) {
      return res
        .status(404)
        .json({ mensaje: "Configuración de correo no encontrada" });
    }
    res.status(200).json(config);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener la configuración de correo", error });
  }
});

// Actualizar la configuración de correo
router.put("/correo/configuracion", async (req, res) => {
  try {
    const actualizaciones = req.body; // Obtener solo los campos recibidos en req.body
    const config = await MailConfig.findOneAndUpdate(
      {},
      { $set: actualizaciones },
      { new: true, upsert: true } // upsert: true asegura que si no existe, se crea una nueva
    );
    res.status(200).json({ mensaje: "Configuración actualizada", config });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar la configuración de correo",
      error,
    });
  }
});

module.exports = router;

module.exports = { crearConfiguracionCorreoPorDefecto };
