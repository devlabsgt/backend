const mongoose = require("mongoose"); // Asegúrate de importar mongoose

const AvanceSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    mes: {
      type: String,
      enum: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ],
      required: true,
    },
    año: {
      type: Number,
      required: true,
    },
    estatura: { type: Number, required: true, min: 0.3 },
    pesokg: { type: Number, required: true, min: 1 },
    grasa: { type: Number, required: true, min: 0, max: 100 },
    agua: { type: Number, required: true, min: 0, max: 100 },
    musculo: { type: Number, required: true, min: 0, max: 100 },
    edadMetabolica: { type: Number, required: true },
    grasaViseral: { type: Number, required: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual para calcular el IMC
AvanceSchema.virtual("imc").get(function () {
  return this.pesokg / this.estatura ** 2;
});

const Avance = mongoose.model("Avance", AvanceSchema);

module.exports = Avance;
