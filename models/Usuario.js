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
      enum: ["super", "admin", "maestro"],
      default: "admin",
    },
    activo: { type: Boolean, default: true }, // Para manejo de usuarios inactivos
  },
  { timestamps: true }
);

// Campo virtual para calcular la edad
usuariosSchema.virtual("edad").get(function () {
  if (!this.fechaNacimiento) return null;
  const ageDiffMs = Date.now() - this.fechaNacimiento.getTime();
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
});

// Middleware para marcar inactivo en lugar de eliminar físicamente
usuariosSchema.pre("remove", function (next) {
  this.activo = false;
  this.save().then(() => next()); // Guardamos el cambio de estado antes de continuar
});

module.exports = mongoose.model("Usuario", usuariosSchema);
