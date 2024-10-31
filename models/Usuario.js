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
      default: "Admin",
    },
    activo: { type: Boolean, default: true }, // Para manejo de usuarios inactivos
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usuario", usuariosSchema);
