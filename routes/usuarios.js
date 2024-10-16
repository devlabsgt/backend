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
  .post(/*auth, vRol(["super", "admin"]),*/ registrarUsuario) // Solo "super" y "admin" pueden registrar un nuevo usuario
  .get(/*auth, vRol(["super", "admin", "asistente"]),*/ obtenerUsuarios); // Solo "super", "admin", "asistente" pueden obtener todos los usuarios activos

router.route("/usuariosI").get(auth, vRol(["super"]), obtenerUsuariosI); // Solo "super" puede obtener los usuarios inactivos
router.route("/usuariosI/:id").put(auth, vRol(["super"]), recuperarUsuario); // Solo "super" puede recuperar usuarios inactivos

router
  .route("/usuarios/:id")
  .get(auth, obtenerUsuario) // Obtener un usuario por ID
  .put(auth, vRol(["super", "admin", "usuario"]), actualizarUsuario) // Actualizar un usuario
  .delete(auth, vRol(["super", "admin"]), eliminarUsuario); // Eliminar un usuario

// Rutas para autenticación
router.post("/iniciar", autenticarUsuario); // Cualquier usuario puede iniciar sesión

// Ruta para restablecer la contraseña
router.put("/reset-password", resetPassword); // Cualquier usuario puede restablecer la contraseña

module.exports = router;
