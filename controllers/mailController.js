const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const Usuario = require("../models/Usuario");
const MailConfig = require("../models/MailConfig");

// Función para obtener la configuración de correo desde la base de datos
const obtenerConfiguracionCorreo = async () => {
  const config = await MailConfig.findOne();
  if (!config) {
    throw new Error("Configuración de correo no encontrada");
  }
  return config;
};

// Ruta para enviar el link de recuperación de contraseña
router.post("/recuperacion", async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const token = generarTokenGeneral(usuario._id);
    const linkRecuperacion = `${process.env.FRONTEND_URL}/recuperar-pass?token=${token}`;

    const config = await obtenerConfiguracionCorreo();

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465,
      auth: {
        user: config.emailSender,
        pass: config.emailPassword,
      },
    });

    const subject = "Recuperación de contraseña";
    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2 style="color: #333;">Recuperación de contraseña</h2>
        <p>Haga clic en el botón de abajo para ingresar una nueva contraseña:</p>
        <a href="${linkRecuperacion}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">
          Restablecer contraseña
        </a>
        <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
        <a href="https://wa.me/${config.telefono}" style="display: inline-block; padding: 10px 20px; background-color: #25D366; color: white; text-decoration: none; border-radius: 5px;">
          Contactarnos por WhatsApp
        </a>
        <p>Si no solicitó este cambio, simplemente ignore este correo.</p>
      </div>
    `;

    const mailOptions = {
      from: config.emailSender,
      to: usuario.email,
      subject,
      html,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res
          .status(500)
          .json({ mensaje: "Error al enviar el correo", error });
      } else {
        return res
          .status(200)
          .json({ mensaje: "Link de recuperación enviado exitosamente" });
      }
    });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: "Error al enviar el link de recuperación" });
  }
});

module.exports = { router };
