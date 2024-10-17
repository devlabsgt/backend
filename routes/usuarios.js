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
router.route("/usuariosI").get(obtenerUsuariosI);
router.route("/usuariosI/:id").put(recuperarUsuario);

// CRUD Usuarios
router.route("/usuarios").post(registrarUsuario).get(obtenerUsuarios);

router
  .route("/usuarios/:id")
  .get(obtenerUsuario)
  .put(actualizarUsuario)
  .delete(eliminarUsuario);

// Rutas para autenticación
router.post("/iniciar", autenticarUsuario);

// Ruta para restablecer la contraseña
router.put("/reset-password", resetPassword);

module.exports = router;
