const mongoose = require("mongoose"); // Agregamos la importación de mongoose

// Definimos el esquema para los estudiantes
const EstudianteSchema = mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    telefono: {
      type: String,
      trim: true,
    },
    fechaNacimiento: {
      type: Date,
      required: true,
    },
    estado: {
      type: String,
      enum: ["Solvente", "Inactivo", "Moroso"],
      default: "Solvente",
    },
    cursoAsignado: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Curso", // Relación con el modelo Curso
      },
    ], // Es un array de ObjectId para manejar múltiples cursos
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Estudiante", EstudianteSchema);
