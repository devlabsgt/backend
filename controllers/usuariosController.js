const express = require("express");
const router = express.Router();
const Usuarios = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const vRol = require("../middleware/vRol");

//Función para crear un superusuario por defecto
const crearSuperUsuarioPorDefecto = async () => {
  try {
    const superUsuarioExistente = await Usuarios.findOne({ rol: "Super" });
    if (superUsuarioExistente) {
      console.log("Ya existe un superusuario. No se necesita crear uno nuevo.");
      return;
    }

    const hashedPassword = await bcrypt.hash("superpyb", 10);
    const nuevoSuperUsuario = new Usuarios({
      nombre: "Super Usuario PyB",
      email: "pyb@super.com",
      password: hashedPassword,
      telefono: "502",
      rol: "Super",
      fechaNacimiento: new Date(2000, 1, 1),
    });

    await nuevoSuperUsuario.save();
    console.log(
      "Superusuario creado por defecto, recuerda cambiar el password."
    );
  } catch (error) {
    console.error("Error al crear el superusuario por defecto:", error);
  }
};
//Registrar usuario
router.post(
  "/usuario",
  auth,
  vRol(["Administrador", "Super"]),
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

      await usuario.save();
      res.json({ mensaje: "Usuario creado correctamente" });
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
    const usuario = await Usuarios.findOne({ email });
    if (!usuario || !usuario.activo) {
      return res
        .status(401)
        .json({ mensaje: "Usuario no existe o está inactivo" });
    }

    const esValida = await bcrypt.compare(password, usuario.password);
    if (!esValida) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al autenticar", error });
  }
});
//Obtener un usuario activo por su ID
router.get("/usuario/:id", auth, async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuarios.findOne({ _id: id }).select(
      "nombre email telefono rol fechaNacimiento"
    );
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const usuarioConEdad = { ...usuario.toObject(), edad: usuario.edad };
    res.json(usuarioConEdad);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener el usuario", error });
  }
});
//Obtener todos los usuarios activos
router.get("/usuario", auth, async (req, res) => {
  const { rol, activo } = req.query; // Agregar `activo` como parámetro de consulta

  try {
    const filtro = {}; // Crear un filtro vacío

    // Aplicar filtro según el rol si existe
    if (rol) {
      filtro.rol = rol;
    }

    // Filtrar según el valor de `activo` proporcionado en la consulta
    if (activo !== undefined) {
      filtro.activo = activo === "true"; // Convertir el valor de `activo` a booleano
    }

    const usuarios = await Usuarios.find(filtro).select(
      "nombre email telefono rol fechaNacimiento activo"
    );
    const usuariosConEdad = usuarios.map((usuario) => ({
      ...usuario.toObject(),
      edad: usuario.edad,
    }));

    res.json(usuariosConEdad);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener usuarios", error });
  }
});
// Restablecer contraseña
router.post("/usuario/resContra", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuarios.findById(decoded.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
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
  crearSuperUsuarioPorDefecto,
};
