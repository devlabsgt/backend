const express = require("express");
const router = express.Router();
const Usuarios = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth");
const vRol = require("../middleware/vRol");
const MailConfig = require("../models/MailConfig");

// Función para obtener la configuración de correo
const obtenerConfiguracionCorreo = async () => {
  const config = await MailConfig.findOne();
  if (!config) {
    throw new Error("Configuración de correo no encontrada");
  }
  return config;
};

// Función para generar un token de verificación
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Función para enviar el correo de verificación
const enviarCorreoVerificacion = async (usuarioEmail, usuarioId) => {
  const token = generarToken(usuarioId);
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

  const verificationLink = `${process.env.FRONTEND_URL}/verificar?token=${token}`;
  const subject = "Verificación de cuenta";
  const html = `
    <div style="font-family: Arial, sans-serif; text-align: center;">
      <h2 style="color: #333;">¡Bienvenido a Paz y Bien!</h2>
      <p>Estamos encantados de tenerte como parte de nuestra comunidad.</p>
      <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #007BFF; color: #fff; text-decoration: none; border-radius: 5px;">
        Verificar cuenta
      </a>
      <p>Si tienes alguna pregunta, no dudes en contactarnos:</p>
      <a href="https://wa.me/502${config.telefono}" style="display: inline-block; padding: 10px 20px; background-color: #25D366; color: white; text-decoration: none; border-radius: 5px;">
        Contactarnos por WhatsApp
      </a>
      <p>Si no solicitaste esta acción, ignora este mensaje.</p>
    </div>
  `;

  await transporter.sendMail({
    from: config.emailSender,
    to: usuarioEmail,
    subject,
    html,
  });
};
// Ruta para reenviar el correo de verificación
router.post("/reenviar-verificacion", async (req, res) => {
  const { email } = req.body;

  try {
    // Buscar el usuario por su correo
    const usuario = await Usuarios.findOne({ email });
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Verificar si el usuario ya está verificado
    if (usuario.verificado) {
      return res.status(400).json({ mensaje: "La cuenta ya está verificada" });
    }

    // Enviar el correo de verificación
    await enviarCorreoVerificacion(usuario.email, usuario._id);
    res
      .status(200)
      .json({ mensaje: "Correo de verificación reenviado exitosamente" });
  } catch (error) {
    console.error("Error al reenviar correo de verificación:", error);
    res
      .status(500)
      .json({ mensaje: "Error al reenviar el correo de verificación" });
  }
});
// Registrar usuario
router.post(
  "/usuario",
//  auth,
//  vRol(["Administrador", "Super"]),
  async (req, res) => {
    const { nombre, email, password, telefono, rol, fechaNacimiento } =
      req.body;

    try {
      // Verificar si el correo ya está en uso
      const usuarioExistente = await Usuarios.findOne({ email });
      if (usuarioExistente) {
        return res.status(400).json({ mensaje: "El correo ya está en uso" });
      }

      // Encriptar la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(password, 12);
      const usuario = new Usuarios({
        nombre,
        email,
        password: hashedPassword,
        rol,
        telefono,
        fechaNacimiento,
      });

      // Guardar usuario en la base de datos
      const usuarioGuardado = await usuario.save();

      // Enviar correo de verificación
      await enviarCorreoVerificacion(usuario.email, usuarioGuardado._id);

      res.json({
        mensaje:
          "Usuario creado correctamente. Se ha enviado un correo de verificación.",
      });
    } catch (error) {
      // Enviar el mensaje de error detallado al frontend
      res.status(500).json({
        mensaje: "Error al crear el usuario: " + error.message,
        error: error.message || error,
      });
    }
  }
);

//Actualizar usuario
router.put(
  "/usuario/:id",
  auth,
  vRol(["Administrador", "Super"]),
  async (req, res) => {
    const { id } = req.params;
    const actualizaciones = req.body;

    try {
      // Verifica si se requiere cambio de contraseña
      if (actualizaciones.newPassword) {
        const hashedPassword = await bcrypt.hash(
          actualizaciones.newPassword,
          10
        );
        actualizaciones.password = hashedPassword;
        delete actualizaciones.newPassword;
      }

      // Actualiza solo los campos recibidos en `actualizaciones`
      const usuarioActualizado = await Usuarios.findByIdAndUpdate(
        id,
        { $set: actualizaciones },
        { new: true, runValidators: true }
      );

      if (!usuarioActualizado) {
        return res.status(404).json({
          mensaje: `Usuario no encontrado con el ID ${id}`,
          error: "UsuarioInexistente",
        });
      }

      res.json({ mensaje: "Usuario actualizado", usuario: usuarioActualizado });
    } catch (error) {
      // Manejo de errores con detalles específicos
      let errorMessage = "Error al actualizar el usuario";
      let errorCode = "ErrorDesconocido";

      if (error.name === "ValidationError") {
        errorMessage = "Datos no válidos para actualizar el usuario";
        errorCode = "ErrorValidacion";
      } else if (error.code === 11000) {
        errorMessage = "El correo electrónico o nombre de usuario ya existe";
        errorCode = "ErrorDuplicado";
      }

      res.status(500).json({
        mensaje: errorMessage,
        codigo: errorCode,
        detalles: error.message, // opcional: puedes eliminarlo en producción si es muy detallado
      });
    }
  }
);
//Autenticar usuario
router.post("/iniciarSesion", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Busca el usuario por email
    const usuario = await Usuarios.findOne({ email });

    if (!usuario) {
      return res.status(401).json({ mensaje: "Usuario no existe" });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: "Usuario desactivado" });
    }

    if (!usuario.verificado) {
      return res.status(403).json({ mensaje: "Usuario no verificado" });
    }

    // Verifica la contraseña
    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    // Genera el token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Actualiza el campo `sesion` a `true` al iniciar sesión exitosamente
    usuario.sesion = true;
    await usuario.save();

    // Responde con el token y los estados
    res.json({ token, activo: usuario.activo, verificado: usuario.verificado });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al autenticar", error });
  }
});
//cerrar sesion
// Controlador de cierre de sesión actualizado
router.put("/usuario/:id/cerrarsesion", async (req, res) => {
  const { id } = req.params;

  try {
    // Cambia el estado de sesión a `false` sin condiciones adicionales
    await Usuarios.findByIdAndUpdate(id, { sesion: false });
    res.json({ mensaje: "Sesión cerrada exitosamente." });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al cerrar la sesión", error });
  }
});

//Obtener un usuario activo por su ID
// Obtener un usuario activo por su ID
router.get("/usuario/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuarios.findById(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const usuarioConEdad = { ...usuario.toObject(), edad: usuario.edad };
    res.json(usuarioConEdad);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el usuario", error });
  }
});
// Obtener todos los usuarios con filtro opcional por rol y activo
// Obtener todos los usuarios
router.get("/usuario", 
  // auth, 
  async (req, res) => {
  try {
    const usuarios = await Usuarios.find();
    const usuariosConEdad = usuarios.map((usuario) => ({
      ...usuario.toObject(),
      edad: usuario.edad,
    }));

    res.json(usuariosConEdad);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error });
  }
});

// Ruta para verificar el usuario
router.put("/verificar", async (req, res) => {
  const { token } = req.body;

  try {
    // Verificar el token y extraer el ID del usuario
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuarioId = decoded.id;

    // Buscar el usuario y actualizar el campo `verificado`
    const usuario = await Usuarios.findByIdAndUpdate(
      usuarioId,
      { verificado: true },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Cuenta verificada exitosamente" });
  } catch (error) {
    console.error("Token verification error:", error); // Log detallado
    res.status(400).json({
      mensaje: "Token inválido o expirado",
      error: error.message, // Detalles del error en la respuesta
    });
  }
});

// Ruta para enviar el link de recuperación de contraseña
router.post("/recuperacion", async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuarios.findOne({ email }); // Cambiado a Usuarios
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const token = generarToken(usuario._id);
    const linkRecuperacion = `${process.env.FRONTEND_URL}/restablecer?token=${token}`;

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
    return res.status(500).json({
      mensaje: "Error al enviar el link de recuperación: " + error,
    });
  }
});

// Restablecer contraseña
router.post("/restablecer", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuarios.findById(decoded.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    usuario.password = hashedPassword;

    await usuario.save();
    res.json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(400).json({
        mensaje: "El enlace ha expirado. Por favor solicita uno nuevo.",
      });
    } else if (error.name === "JsonWebTokenError") {
      res.status(400).json({ mensaje: "Token inválido." });
    } else {
      res
        .status(500)
        .json({ mensaje: "Error al actualizar la contraseña", error });
    }
  }
});

//exportación de rutas funciones
module.exports = {
  router,
};
