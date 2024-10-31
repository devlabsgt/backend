const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DonanteSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    contacto: {
      type: String, // Información del contacto principal
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    direccion: {
      type: String, // Dirección física del donante
      trim: true,
    },
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

module.exports = mongoose.model("Donante", DonanteSchema);
