const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Esquema para los objetivos globales
const ObjetivoGlobalSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: String
});

// Esquema para las líneas estratégicas
const LineaEstrategicaSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: String
});

// Esquema para las actividades
const ActividadPrincipalSchema = new Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: String,
  meta: Number,
  indicadores: [String]
});

// Esquema para las evidencias
const EvidenciaSchema = new Schema({
  tipo: {
    type: String,
    required: true
  },
  archivo: {
    type: String,  // URL o path del archivo
    required: true
  },
  fechaSubida: {
    type: Date,
    default: Date.now
  },
  descripcion: String
});

// Esquema principal del proyecto actualizado
const ProyectoSchema = new Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    objetivosGlobales: [{
      type: Schema.Types.ObjectId,
      ref: 'ObjetivoGlobal'
    }],
    lineasEstrategicas: [{
      type: Schema.Types.ObjectId,
      ref: 'LineaEstrategica'
    }],
    actividadesPrincipales: [{
      type: Schema.Types.ObjectId,
      ref: 'ActividadPrincipal'
    }],
    encargado: {
      type: Schema.Types.ObjectId,
      ref: "Usuario", // Referencia a la colección Usuario
      required: true,
    },
    donantes: [{
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
    personasAlcanzadas: {
      type: Number,
      default: 0
    },
    beneficiarios: [{
      beneficiario: {
        type: Schema.Types.ObjectId,
        ref: "Beneficiario",
        required: true
      },
      estado: {
        type: String,
        enum: ["Activo", "Inactivo"],
        default: "Activo"
      },
      fechaIngreso: {
        type: Date,
        default: Date.now
      },
      observaciones: String
    }],
    lugaresAPriorizar: [{
      departamento: {
        type: String,
        required: true,
      },
      municipio: {
        type: String,
        required: true,
      },
      localidad: {
        type: String,
        required: true,
      },
      prioridad: {
        type: Number,
        min: 1,
        max: 5
      }
    }],
    implicacionMunicipalidades: {
      type: String,
      enum: ['Alta', 'Media', 'Baja', 'Nula'],
      required: true
    },
    nivelAvance: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    estado: {
      type: String,
      enum: ["Activo", "Finalizado", "Suspendido", "Inactivo"],
      default: "Activo",
    },
    fechaInicio: {
      type: Date,
      required: true,
    },
    fechaFinal: {
      type: Date,
      required: true
    },
    seguimiento: {
      frecuencia: {
        type: String,
        enum: ['semanal', 'mensual', 'trimestral'],
        required: true
      },
      requiereVisita: {
        type: Boolean,
        default: false
      },
      proximoSeguimiento: Date
    },
    evidencias: [EvidenciaSchema],
    observaciones: String,
    codigo: {
      type: String,
      unique: true,
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Modelos
const ObjetivoGlobal = mongoose.model('ObjetivoGlobal', ObjetivoGlobalSchema);
const LineaEstrategica = mongoose.model('LineaEstrategica', LineaEstrategicaSchema);
const ActividadPrincipal = mongoose.model('ActividadPrincipal', ActividadPrincipalSchema);
const Proyecto = mongoose.model('Proyecto', ProyectoSchema);

ProyectoSchema.pre('save', function(next) {
  if (this.beneficiarios) {
    this.personasAlcanzadas = this.beneficiarios.filter(b => b.estado === "Activo").length;
  }
  next();
});

module.exports = {
  ObjetivoGlobal,
  LineaEstrategica,
  ActividadPrincipal,
  Proyecto
};