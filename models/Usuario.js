const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const usuariosSchema = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    telefono: { type: String, required: true },
    rol: {
      type: String,
      enum: ["admin", "asistente", "paciente", "super"],
      default: "paciente",
    },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Usuario", usuariosSchema);
