const Usuarios = require("../models/Usuario");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

// Función para crear un superusuario por defecto
exports.crearSuperUsuarioPorDefecto = async () => {
  try {
    // Verificar si ya existe un superusuario
    const superUsuarioExistente = await Usuarios.findOne({ rol: "super" });

    if (superUsuarioExistente) {
      console.log("Ya existe un superusuario. No se necesita crear uno nuevo.");
      return;
    }

    // Si no existe un superusuario, crear uno por defecto
    const hashedPassword = await bcrypt.hash("super", 10); // Hashear la contraseña
    const nuevoSuperUsuario = new Usuarios({
      nombre: "Super Usuario", // Nombre por defecto
      email: "super@admin.com", // Email por defecto
      password: hashedPassword, // Usar la contraseña hasheada
      telefono: "502123456789", // Teléfono por defecto
      rol: "super",
    });

    await nuevoSuperUsuario.save();
    console.log("Superusuario creado por defecto.");
  } catch (error) {
    console.error("Error al crear el superusuario por defecto:", error);
  }
};

// Controlador para registrar usuario
exports.registrarUsuario = async (req, res) => {
  const { nombre, email, password, telefono, rol } = req.body;

  try {
    // Verifica si el email ya está en uso
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
  const { nombre, email, telefono, rol, oldPassword, newPassword } = req.body;

  try {
    let usuario = await Usuarios.findById(id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Verificar si se proporciona la contraseña antigua (solo para "Mi Perfil")
    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, usuario.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ mensaje: "La contraseña antigua es incorrecta" });
      }

      // Encriptar la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      usuario.password = hashedPassword;
    } else if (newPassword) {
      // Encriptar la nueva contraseña
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      usuario.password = hashedPassword;
    }

    // Actualizar los demás campos
    usuario.nombre = nombre || usuario.nombre;
    usuario.email = email || usuario.email;
    usuario.telefono = telefono || usuario.telefono;
    usuario.rol = rol || usuario.rol;

    const usuarioActualizado = await usuario.save();
    return res
      .status(200)
      .json({ mensaje: "Usuario actualizado", usuario: usuarioActualizado });
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    return res
      .status(500)
      .json({ mensaje: "Error al actualizar el usuario", error });
  }
};

// Eliminar (marcar como inactivo)
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioInactivo = await Usuarios.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!usuarioInactivo) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json({ mensaje: "Usuario marcado como inactivo correctamente" });
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Hubo un error al marcar como inactivo", error });
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
        primeraVez: usuario.primeraVez,
      },
      process.env.JWT_SECRET, // Usa variable de entorno para el secreto
      { expiresIn: "1m" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ mensaje: "Hubo un error al autenticar", error });
  }
};

// Obtener todos los usuarios activos
exports.obtenerUsuarios = async (req, res) => {
  const { rol } = req.query; // Obtener el rol de la consulta (query)

  try {
    // Condición de búsqueda
    const filtro = { activo: true };

    // Si se proporciona un rol, lo añadimos al filtro
    if (rol) {
      filtro.rol = rol;
    }

    // Buscar usuarios con el filtro activo y opcionalmente con el rol especificado
    const usuarios = await Usuarios.find(filtro);
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Hubo un error al obtener usuarios", error });
  }
};

// Obtener todos los usuarios inactivos
exports.obtenerUsuariosI = async (req, res) => {
  try {
    const usuarios = await Usuarios.find({ activo: false });
    res.json(usuarios);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Hubo un error al obtener usuarios inactivos", error });
  }
};

// Obtener un usuario activo por su ID
exports.obtenerUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuarios.findOne({ _id: id, activo: true });

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Hubo un error al obtener el usuario", error });
  }
};
// Función para manejar el restablecimiento de contraseña (resetPassword)
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body; // Token y nueva contraseña

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar al usuario por ID obtenido del token
    let usuario = await Usuarios.findById(decoded.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Encriptar y actualizar la nueva contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    usuario.password = hashedPassword;

    await usuario.save();

    return res
      .status(200)
      .json({ mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    // Si el token es inválido o ha expirado
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
