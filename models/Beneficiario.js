const mongoose = require("mongoose");

// Definimos el esquema para los beneficiarios
const BeneficiarioSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    dpi: {
      type: String,
      required: true,
      unique: true, // Asegura que el DPI sea único
    },
    fechaNacimiento: {
      type: Date,
      required: true,
    },
    genero: {
      type: String,
      enum: ["Masculino", "Femenino", "Otro"],
    },
    estadoCivil: {
      type: String,
      enum: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"],
    },
    departamento: {
      type: String,
      required: true,
      trim: true,
    },
    municipio: {
      type: String,
      required: true,
      trim: true,
    },
    localidad: {
      type: String,
      required: true,
      trim: true,
    },
    nombrePadre: {
      type: String,
      trim: true,
    },
    nombreMadre: {
      type: String,
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    Proyecto: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proyecto", // Relación con el modelo Proyecto
      },
    ], // Es un array de ObjectId para manejar múltiples proyectos
    activo: { type: Boolean, default: true }, // Para manejo de beneficiarios inactivos
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Beneficiario", BeneficiarioSchema);
