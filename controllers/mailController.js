const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Cargar variables de entorno si es necesario
const Usuario = require("../models/Usuario"); // Modelo de usuario
const MailConfig = require("../models/MailConfig"); // Modelo de configuración de correo

// Función para obtener la configuración de correo desde la base de datos
const obtenerConfiguracionCorreo = async () => {
  const config = await MailConfig.findOne(); // Buscar la configuración en la base de datos
  if (!config) {
    throw new Error("Configuración de correo no encontrada");
  }
  return config;
};

// Función para enviar un correo con soporte de texto plano y HTML
const enviarMensaje = async (req, res) => {
  try {
    const config = await obtenerConfiguracionCorreo();

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // Usar SSL solo si el puerto es 465
      auth: {
        user: config.emailSender,
        pass: config.emailPassword,
      },
    });

    const { to, subject, text, html } = req.body;

    const mailOptions = {
      from: config.emailSender,
      to,
      subject,
      text: text || null,
      html:
        html ||
        `
        <div style="font-family: Arial, sans-serif; text-align: center;">
          <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
          <a href="https://wa.me/${config.telefono}" style="display: inline-block; padding: 10px 20px; background-color: #25D366; color: white; text-decoration: none; border-radius: 5px;">
            Contactarnos por WhatsApp
          </a>
        </div>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ mensaje: "Error al enviar el correo", error });
      } else {
        return res.status(200).json({ mensaje: "Correo enviado exitosamente" });
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Función para enviar el mensaje de bienvenida
const enviarMensajeBienvenida = async (req, res) => {
  const { email } = req.body; // Email del destinatario

  try {
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

    const subject = "¡Bienvenido a APPNutrition!";
    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center;">
        <h2 style="color: #333;">¡Bienvenido a APPNutrition!</h2>
        <p>Estamos encantados de tenerte como parte de nuestra comunidad.</p>
        <a href="${process.env.FRONTEND_URL}/login" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">
          Iniciar Sesión
        </a>
        <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
        <a href="https://wa.me/${config.telefono}" style="display: inline-block; padding: 10px 20px; background-color: #25D366; color: white; text-decoration: none; border-radius: 5px;">
          Contactarnos por WhatsApp
        </a>
      </div>
    `;

    const mailOptions = {
      from: config.emailSender,
      to: email,
      subject,
      html,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res
          .status(500)
          .json({ mensaje: "Error al enviar el correo", error });
      } else {
        return res
          .status(200)
          .json({ mensaje: "Correo de bienvenida enviado exitosamente" });
      }
    });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Función para generar un token JWT
const generarToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: "5m" });
};

// Función para enviar el link de recuperación de contraseña
const enviarLinkRecuperacion = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const token = generarToken(usuario._id, usuario.email);
    const link = `${process.env.FRONTEND_URL}/recuperar-pass?token=${token}`;

    const config = await obtenerConfiguracionCorreo();

    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // Usar SSL solo si el puerto es 465
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
        <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">
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

    transporter.sendMail(mailOptions, (error, info) => {
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
};

module.exports = {
  enviarMensaje,
  enviarLinkRecuperacion,
  enviarMensajeBienvenida,
};
