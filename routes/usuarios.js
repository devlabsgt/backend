const express = require("express");
const router = express.Router();
const {
  registrarUsuario,
  autenticarUsuario,
  obtenerUsuarios,
  obtenerUsuariosI,
  obtenerUsuario,
  actualizarUsuario,
  eliminarUsuario,
  resetPassword,
} = require("../controllers/usuariosController");

// Middleware para proteger las rutas
const auth = require("../middleware/auth");
const vRol = require("../middleware/vRol");

// CRUD Usuarios
router
  .route("/usuarios")
  .post(registrarUsuario) // Registrar un nuevo usuario
  .get(obtenerUsuarios); // Obtener todos los usuarios activos

router.route("/usuariosI").get(obtenerUsuariosI); // Obtener todos los usuarios inactivos

router
  .route("/usuarios/:id")
  .get(obtenerUsuario) // Obtener un usuario por ID
  .put(actualizarUsuario) // Actualizar un usuario
  .delete(eliminarUsuario); // Eliminar un usuario

// Rutas para autenticación
router.post("/iniciar", autenticarUsuario); // Iniciar sesión

// Ruta para restablecer la contraseña
router.put("/reset-password", resetPassword); // Restablecer la contraseña

module.exports = router;
