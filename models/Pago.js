const mongoose = require("mongoose");

// Función para generar un número de recibo aleatorio (3 dígitos y 3 letras)
function generarNumeroRecibo() {
  const numeros = Math.floor(100 + Math.random() * 900); // Generar 3 dígitos aleatorios
  const letras = String.fromCharCode(
    65 + Math.floor(Math.random() * 26), // Generar letra mayúscula aleatoria
    65 + Math.floor(Math.random() * 26),
    65 + Math.floor(Math.random() * 26)
  );
  return `${numeros}${letras}`;
}

// Definimos el esquema para los pagos
const PagoSchema = new mongoose.Schema(
  {
    estudiante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estudiante", // Relación con el modelo Estudiante
      required: true,
    },
    curso: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Curso", // Relación con el modelo Curso
      required: true,
    },
    monto: {
      type: Number,
      required: true,
      min: 0,
    },
    mes: {
      type: String,
      enum: [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
      ],
      required: true,
    },
    noRecibo: {
      type: String,
      unique: true, // Asegura que el número de recibo sea único
    },
  },
  {
    timestamps: true, // Agrega los campos createdAt y updatedAt automáticamente
  }
);

// Middleware para generar un número de recibo único antes de guardar el documento
PagoSchema.pre("save", async function (next) {
  const pago = this;

  // Solo generar el número de recibo si no está ya definido
  if (!pago.noRecibo) {
    let numeroRecibo;
    let existe = true;

    // Repetir hasta que se genere un número de recibo único
    while (existe) {
      numeroRecibo = generarNumeroRecibo();
      const pagoExistente = await mongoose.models.Pago.findOne({
        noRecibo: numeroRecibo,
      });
      if (!pagoExistente) {
        existe = false; // Salir del ciclo si no se encuentra un número duplicado
      }
    }

    // Asignar el número de recibo generado
    pago.noRecibo = numeroRecibo;
  }

  next();
});

module.exports = mongoose.model("Pago", PagoSchema);
