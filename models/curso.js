const mongoose = require("mongoose");

// Definimos el esquema para los cursos
const CursoSchema = mongoose.Schema(
  {
    curso: {
      type: String,
      required: true,
      trim: true,
    },
    rangoEdad: {
      type: String,
      enum: ["niños", "adolescentes", "adultos"], // Rango de edad del curso
      required: true,
    },
    horario: {
      type: String,
      required: true,
    },
    modalidad: {
      type: String,
      enum: ["presencial", "virtual"], // Modalidad del curso
      required: true,
    },
    cuota: {
      type: Number, // Puedes usar "Number" para representar la cuota
      required: true, // Si es obligatorio que todos los cursos tengan una cuota
      min: 0, // Establecemos un valor mínimo para evitar números negativos
    },
  },
  {
    timestamps: true, // Crea automáticamente createdAt y updatedAt
  }
);

module.exports = mongoose.model("Curso", CursoSchema);
