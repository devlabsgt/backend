const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Definimos el esquema para los proyectos
const ProyectoSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    encargado: {
      type: Schema.Types.ObjectId,
      ref: "Usuario", // Referencia a la colección Usuario
      required: true,
    },
    donantes: [
      {
        donante: {
          type: Schema.Types.ObjectId,
          ref: "Donante", // Referencia a la colección Donante
          required: true,
        },
        porcentaje: {
          type: Number, // Porcentaje del presupuesto que aporta este donante
          required: true,
          min: 0,
          max: 100,
        },
      },
    ], // Array de objetos para manejar múltiples donantes y sus porcentajes

    presupuesto: {
      type: Number, // Presupuesto asignado al proyecto
      required: true,
      min: 0,
    },
    nivelAvance: {
      type: Number, // Nivel de avance del proyecto en porcentaje
      min: 0,
      max: 100,
      default: 0, // Se inicia en 0% de avance
    },
    estado: {
      type: String,
      enum: ["Activo", "Finalizado"], // Estado del proyecto
      default: "Activo",
    },
    fechaInicio: {
      type: Date, // Fecha de inicio del proyecto
      required: true,
    },
    fechaFinal: {
      type: Date, // Fecha de finalización del proyecto
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
    codigo: {
      type: String, // Código único de 3 números y 3 letras
      unique: true,
      required: false,
    },
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

// Definimos el esquema para las actividades
const ActividadSchema = new Schema(
  {
    descripcion: {
      type: String, // Descripción de la actividad
      required: true,
      trim: true,
    },
    presupuesto: {
      type: Number, // Presupuesto asignado a la actividad
      required: true,
      min: 0,
    },
    proyecto: {
      type: Schema.Types.ObjectId, // Referencia al proyecto
      ref: "Proyecto",
      required: true,
    },
    beneficiario: {
      type: Schema.Types.ObjectId, // Referencia al beneficiario
      ref: "Beneficiario",
      required: true,
    },
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

// Exportamos ambos modelos en un solo objeto
module.exports = {
  Proyecto: mongoose.model("Proyecto", ProyectoSchema),
  Actividad: mongoose.model("Actividad", ActividadSchema),
};
