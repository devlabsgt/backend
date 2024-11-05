const mongoose = require("mongoose");

// Esquema de Direccion
const DireccionSchema = mongoose.Schema({
  departamento: {
    type: String, // Usaremos String para almacenar el departamento
    required: true,
  },
  municipio: {
    type: String, // Usaremos String para almacenar el municipio
    required: true,
  },
  localidad: {
    type: String,
    required: true,
    trim: true,
  },
  direccion: {
    type: String,
    required: true,
    trim: true,
  },
});

const Direccion = mongoose.model("Direccion", DireccionSchema);
// Esquema de Beneficiario
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
      unique: true,
    },
    fechaNacimiento: {
      type: Date,
      required: true,
    },
    genero: {
      type: String,
      enum: ["Masculino", "Femenino"],
    },
    estadoCivil: {
      type: String,
      enum: ["Soltero/a", "Casado/a", "Divorciado/a", "Viudo/a"],
    },
    direccion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Direccion", // Hace referencia a la colección de Direcciones
      required: true,
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
        ref: "Proyecto",
      },
    ],
    activo: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  Beneficiario: mongoose.model("Beneficiario", BeneficiarioSchema),
  Direccion,
};
