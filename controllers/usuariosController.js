const Usuarios = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Función para crear un superusuario por defecto
exports.crearSuperUsuarioPorDefecto = async () => {
  try {
    const superUsuarioExistente = await Usuarios.findOne({ rol: "super" });
    if (superUsuarioExistente) {
      console.log("Ya existe un superusuario. No se necesita crear uno nuevo.");
      return;
    }

    const hashedPassword = await bcrypt.hash("superappn", 10);
    const nuevoSuperUsuario = new Usuarios({
      nombre: "Super APPN",
      email: "appn@super.com",
      password: hashedPassword,
      telefono: "502123456789",
      rol: "super",
      fechaNacimiento: new Date(1992, 5, 28), // Los meses en JavaScript son 0-indexados, así que junio es el mes 5
    });

    await nuevoSuperUsuario.save();
    console.log(
      "Superusuario creado por defecto, recuerda cambiar el password."
    );
  } catch (error) {
    console.error("Error al crear el superusuario por defecto:", error);
  }
};

// Controlador para registrar usuario
exports.registrarUsuario = async (req, res) => {
  const { nombre, email, password, telefono, rol, fechaNacimiento } = req.body;

  try {
    const usuarioExistente = await Usuarios.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: "El correo ya está en uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const usuario = new Usuarios({
      nombre,
      email,
      password: hashedPassword,
      rol,
      telefono,
      fechaNacimiento, // Ahora almacenamos la fecha de nacimiento
    });

    await usuario.save();
    res.json({ mensaje: "Usuario creado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Hubo un error al crear el usuario", error });
  }
};
// Controlador para actualizar usuario
exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, telefono, rol, newPassword, fechaNacimiento } =
    req.body;

  try {
    let usuario = await Usuarios.findById(id);

    if (!usuario) {
      return res
        .status(404)
        .json({ mensaje: `Usuario no encontrado con el ID ${id}` });
    }

    // Solo actualizar la contraseña si se está enviando
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      usuario.password = hashedPassword;
    }

    // Actualizar solo los campos enviados
    if (nombre) usuario.nombre = nombre;
    if (email) usuario.email = email;
    if (telefono) usuario.telefono = telefono;
    if (rol) usuario.rol = rol;

    // Solo actualiza la fecha de nacimiento si se envía explícitamente
    if (fechaNacimiento) {
      usuario.fechaNacimiento = fechaNacimiento;
    }

    const usuarioActualizado = await usuario.save();
    return res
      .status(200)
      .json({ mensaje: "Usuario actualizado", usuario: usuarioActualizado });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({
      mensaje: "Error al actualizar el usuario",
      error: error.message,
    });
  }
};
// Controlador para eliminar (marcar como inactivo) un usuario
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuarioInactivo = await Usuarios.findById(id);

    if (!usuarioInactivo) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Cambia el campo activo a false en lugar de eliminar el documento
    usuarioInactivo.activo = false;
    await usuarioInactivo.save();

    res.json({ mensaje: "Usuario eliminado" });
  } catch (error) {
    console.error("Hubo un error al intentar eliminar el usuario:", error); // Log para mostrar el error en el servidor
    res.status(500).json({
      mensaje: "Hubo un error al eliminar usuario",
      error: error.message,
    });
  }
};

// Recuperar Usuario (marcar como activo)
exports.recuperarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioInactivo = await Usuarios.findByIdAndUpdate(
      id,
      { activo: true },
      { new: true }
    );
    if (!usuarioInactivo) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario recuperado correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Hubo un error al recuperar usuario", error });
  }
};

// Autenticación de usuario
exports.autenticarUsuario = async (req, res) => {
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
        email: usuario.email,
        nombre: usuario.nombre,
        id: usuario._id,
        rol: usuario.rol,
        edad: usuario.edad, // Incluimos la edad calculada en el token
      },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error al autenticar", error });
  }
};

// Obtener un usuario activo por su ID
exports.obtenerUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuarios.findOne({ _id: id, activo: true }).select(
      "nombre email telefono rol fechaNacimiento" // Añadir fechaNacimiento
    );

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Agregar el campo virtual "edad" manualmente a la respuesta
    const usuarioConEdad = {
      ...usuario.toObject(),
      edad: usuario.edad, // Añadimos el campo virtual "edad"
    };

    res.json(usuarioConEdad);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Hubo un error al obtener el usuario", error });
  }
};
// Obtener todos los usuarios activos
exports.obtenerUsuarios = async (req, res) => {
  const { rol } = req.query;

  try {
    const filtro = { activo: true };
    if (rol) {
      filtro.rol = rol;
    }

    const usuarios = await Usuarios.find(filtro).select(
      "nombre email telefono rol fechaNacimiento" // Añadir fechaNacimiento
    );

    // Agregar el campo virtual "edad" manualmente a la respuesta
    const usuariosConEdad = usuarios.map((usuario) => ({
      ...usuario.toObject(),
      edad: usuario.edad, // Añadimos el campo virtual "edad"
    }));

    res.json(usuariosConEdad);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Hubo un error al obtener usuarios", error });
  }
};

// Obtener todos los usuarios inactivos
exports.obtenerUsuariosI = async (req, res) => {
  try {
    const usuarios = await Usuarios.find({ activo: false }).select(
      "nombre email telefono rol fechaNacimiento"
    );

    // Agregar el campo virtual "edad" manualmente a la respuesta
    const usuariosConEdad = usuarios.map((usuario) => ({
      ...usuario.toObject(),
      edad: usuario.edad,
    }));

    res.json(usuariosConEdad);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Hubo un error al obtener usuarios inactivos", error });
  }
};

// Función para manejar el restablecimiento de contraseña (resetPassword)
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let usuario = await Usuarios.findById(decoded.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    usuario.password = hashedPassword;

    await usuario.save();
    return res
      .status(200)
      .json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        mensaje: "El enlace ha expirado. Por favor solicita uno nuevo.",
      });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ mensaje: "Token inválido." });
    }
    return res
      .status(500)
      .json({ mensaje: "Error al actualizar la contraseña", error });
  }
};
