require("dotenv").config();
const bcrypt = require("bcrypt");
const Usuarios = require("../models/Usuario");
const MailConfig = require("../models/MailConfig");
const mongoose = require("mongoose");

// Conectar a la base de datos
mongoose
  .connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado a la base de datos"))
  .catch((error) =>
    console.error("Error al conectar a la base de datos:", error)
  );

// Función para crear el superusuario por defecto
const crearSuperUsuarioPorDefecto = async () => {
  try {
    const superUsuarioExistente = await Usuarios.findOne({ rol: "Super" });
    if (!superUsuarioExistente) {
      const hashedPassword = await bcrypt.hash(
        process.env.SUPERUSER_PASSWORD,
        10
      );
      await Usuarios.create({
        nombre: process.env.SUPERUSER_NAME,
        email: process.env.SUPERUSER_EMAIL,
        password: hashedPassword,
        telefono: process.env.SUPERUSER_PHONE,
        verificado: true,
        rol: "Super",
        fechaNacimiento: new Date(process.env.SUPERUSER_BIRTHDATE),
      });
      console.log(
        "Superusuario creado por defecto. Recuerda cambiar el password."
      );
    } else {
      console.log("Ya existe un superusuario. No se necesita crear uno nuevo.");
    }
  } catch (error) {
    console.error("Error al crear el superusuario por defecto:", error);
  }
};

// Función para crear la configuración de correo por defecto
const crearConfiguracionCorreoPorDefecto = async () => {
  try {
    const config = await MailConfig.findOne();
    if (!config) {
      await MailConfig.create({
        emailSender: process.env.DEFAULT_EMAIL_SENDER,
        emailPassword: process.env.DEFAULT_EMAIL_PASSWORD,
        smtpHost: process.env.DEFAULT_SMTP_HOST,
        smtpPort: parseInt(process.env.DEFAULT_SMTP_PORT, 10),
        telefono: process.env.DEFAULT_PHONE,
      });
      console.log("Configuración de correo creada por defecto.");
    } else {
      console.log("La configuración de correo ya existe.");
    }
  } catch (error) {
    console.error(
      "Error al crear la configuración de correo por defecto:",
      error
    );
  }
};

// Ejecutar ambas funciones
const ejecutarConfig = async () => {
  await crearSuperUsuarioPorDefecto();
  await crearConfiguracionCorreoPorDefecto();
  mongoose.disconnect(); // Cierra la conexión a la base de datos después de completar las tareas
};

module.exports = ejecutarConfig;
