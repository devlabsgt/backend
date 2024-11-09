const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usuariosSchema = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    telefono: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true }, // Fecha de nacimiento
    rol: {
      type: String,
      enum: ["Super", "Administrador", "Encargado"],
      default: "Administrador",
    },
    sesion: { type: Boolean, default: false }, // Para manejo de usuarios inactivos
    activo: { type: Boolean, default: true }, // Para manejo de usuarios inactivos
    verificado: { type: Boolean, default: false }, // Campo de verificación
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usuario", usuariosSchema);
