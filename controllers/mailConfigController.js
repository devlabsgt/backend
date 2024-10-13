const MailConfig = require("../models/MailConfig");

// Obtener la configuración de correo
const obtenerConfiguracionCorreo = async (req, res) => {
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
};

// Actualizar la configuración de correo (PUT)
const actualizarConfiguracionCorreo = async (req, res) => {
  const { emailSender, emailPassword, smtpHost, smtpPort, telefono } = req.body;

  try {
    // Actualizar la configuración de correo sin encriptar la contraseña
    const config = await MailConfig.findOneAndUpdate(
      {},
      {
        emailSender,
        emailPassword, // Guardar la contraseña como texto plano
        smtpHost,
        smtpPort,
        telefono,
      },
      { new: true, upsert: true } // upsert: true asegura que si no existe, se cree una nueva
    );

    res.status(200).json({ mensaje: "Configuración actualizada", config });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar la configuración de correo" + error,
      error,
    });
  }
};

// Función para inicializar una configuración predefinida si no existe
const crearConfiguracionCorreoPorDefecto = async () => {
  try {
    const config = await MailConfig.findOne();
    if (!config) {
      // Crear una configuración predefinida con contraseña sin encriptar
      await MailConfig.create({
        emailSender: "default@correo.com",
        emailPassword: "defaultpassword",
        smtpHost: "smtp.default.com",
        smtpPort: 465,
        telefono: "50242140797",
      });
    }
  } catch (error) {
    console.error(
      "Error al crear la configuración de correo por defecto:",
      error
    );
  }
};

module.exports = {
  obtenerConfiguracionCorreo,
  actualizarConfiguracionCorreo,
  crearConfiguracionCorreoPorDefecto,
};
