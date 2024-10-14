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
  recuperarUsuario,
} = require("../controllers/usuariosController");

// Middleware para proteger las rutas
const auth = require("../middleware/auth");
const vRol = require("../middleware/vRol");

// CRUD Usuarios
router
  .route("/usuarios")
  .post(auth, vRol(["super", "admin"]), registrarUsuario) // Solo "super" y "admin" pueden registrar un nuevo usuario
  .get(auth, vRol(["super", "admin", "asistente"]), obtenerUsuarios); // Solo "super" y "admin" pueden obtener todos los usuarios activos

router.route("/usuariosI").get(auth, vRol(["super"]), obtenerUsuariosI); // Solo "super" y "admin" pueden obtener los usuarios inactivos
router.route("/usuariosI/:id").put(auth, vRol(["super"]), recuperarUsuario); // Solo "super" y "admin" pueden obtener los usuarios inactivos

router
  .route("/usuarios/:id")
  .get(auth, obtenerUsuario) // "super", "admin" y "usuario" pueden obtener un usuario por ID
  .put(auth, vRol(["super", "admin", "usuario"]), actualizarUsuario) // "super", "admin" y "usuario" pueden actualizar un usuario
  .delete(auth, vRol(["super", "admin"]), eliminarUsuario); // Solo "super" y "admin" pueden eliminar un usuario

// Rutas para autenticación
router.post("/iniciar", autenticarUsuario); // Cualquier usuario puede iniciar sesión

// Ruta para restablecer la contraseña
router.put("/reset-password", resetPassword); // "cualquiera pueden restablecer la contraseña

module.exports = router;
