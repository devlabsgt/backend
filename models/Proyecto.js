const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Esquema para los objetivos globales
const ObjetivoGlobalSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre del objetivo es requerido"],
    trim: true
  },
  descripcion: String
});

// Esquema para las líneas estratégicas
const LineaEstrategicaSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre de la línea estratégica es requerido"],
    trim: true
  },
  descripcion: String
});

// Esquema para las actividades del proyecto
const ActividadSchema = new Schema({
  nombre: {
    type: String,
    required: [true, "El nombre de la actividad es requerido"],
    trim: true
  },
  descripcion: {
    type: String,
    trim: true
  },
  presupuestoAsignado: {
    type: Number,
    required: [true, "El presupuesto de la actividad es requerido"],
    min: [0, "El presupuesto no puede ser negativo"]
  },
  porcentajePresupuesto: {
    type: Number,
    required: true,
    min: [0, "El porcentaje no puede ser menor a 0"],
    max: [100, "El porcentaje no puede ser mayor a 100"]
  },
  beneficiariosAsociados: [{
    beneficiario: {
      type: Schema.Types.ObjectId,
      ref: "Beneficiario",
      required: true
    },
    fechaAsignacion: {
      type: Date,
      default: Date.now
    },
    estado: {
      type: String,
      enum: ["Activo", "Inactivo"],
      default: "Activo"
    },
    observaciones: String
  }],
  fechaInicio: {
    type: Date,
    required: [true, "La fecha de inicio es requerida"]
  },
  fechaFin: {
    type: Date,
    required: [true, "La fecha de finalización es requerida"]
  },
  estado: {
    type: String,
    enum: ["Pendiente", "En Progreso", "Completada"],
    default: "Pendiente"
  },
  avance: {
    type: Number,
    default: 0,
    min: [0, "El avance no puede ser menor a 0"],
    max: [100, "El avance no puede ser mayor a 100"]
  },
  resultadosEsperados: [String],
  metasAlcanzadas: [{
    descripcion: String,
    fecha: Date,
    valor: Number
  }]
});

// Esquema para las evidencias
const EvidenciaSchema = new Schema({
  tipo: {
    type: String,
    required: true,
    enum: ["imagen", "documento"]
  },
  archivo: {
    type: String,
    required: true
  },
  fechaSubida: {
    type: Date,
    default: Date.now
  },
  descripcion: String
});

// Esquema para los donantes con montos específicos
const DonanteProyectoSchema = new Schema({
  donante: {
    type: Schema.Types.ObjectId,
    ref: "Donante",
    required: [true, "El donante es requerido"]
  },
  montoAportado: {
    type: Number,
    required: [true, "El monto aportado es requerido"],
    min: [0, "El monto aportado no puede ser negativo"]
  },
  porcentaje: {
    type: Number,
    min: [0, "El porcentaje no puede ser menor a 0"],
    max: [100, "El porcentaje no puede ser mayor a 100"]
  },
  fechaCompromiso: {
    type: Date,
    default: Date.now
  }
});

// Esquema principal del proyecto
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
    codigo: {
      type: String,
      unique: true,
      required: true,
    },
    objetivosGlobales: [{
      type: Schema.Types.ObjectId,
      ref: 'ObjetivoGlobal'
    }],
    lineasEstrategicas: [{
      type: Schema.Types.ObjectId,
      ref: 'LineaEstrategica'
    }],
    encargado: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    presupuesto: {
      total: {
        type: Number,
        required: true,
        min: [0, "El presupuesto total no puede ser negativo"]
      },
      ejecutado: {
        type: Number,
        default: 0,
        min: [0, "El presupuesto ejecutado no puede ser negativo"]
      }
    },
    donantes: [DonanteProyectoSchema],
    actividades: [ActividadSchema],
    personasAlcanzadas: {
      type: Number,
      default: 0
    },
    beneficiarios: [{
      beneficiario: {
        type: Schema.Types.ObjectId,
        ref: "Beneficiario",
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
    observaciones: String
  },
  {
    timestamps: true,
  }
);

// Middleware para cálculos automáticos antes de guardar
// Middleware para cálculos automáticos antes de guardar
ProyectoSchema.pre('save', async function(next) {
  try {
    // 1. Calcular personas alcanzadas desde las actividades
    if (this.actividades && this.actividades.length > 0) {
      // Obtener beneficiarios únicos de todas las actividades
      const beneficiariosUnicos = new Set();
      
      this.actividades.forEach(actividad => {
        actividad.beneficiariosAsociados
          .filter(b => b.estado === "Activo")
          .forEach(b => {
            beneficiariosUnicos.add(b.beneficiario.toString());
          });
      });

      // Actualizar el contador de personas alcanzadas
      this.personasAlcanzadas = beneficiariosUnicos.size;
    } else {
      this.personasAlcanzadas = 0;
    }

    // 2. Calcular porcentajes y validar montos de donantes
    if (this.donantes && this.donantes.length > 0) {
      const totalAportes = this.donantes.reduce((sum, donante) => 
        sum + donante.montoAportado, 0
      );

      if (totalAportes !== this.presupuesto.total) {
        throw new Error('El total de aportes de los donantes debe ser igual al presupuesto total del proyecto');
      }

      this.donantes.forEach(donante => {
        donante.porcentaje = Number((donante.montoAportado / this.presupuesto.total * 100).toFixed(2));
      });
    }

    // 3. Validar y calcular presupuestos de actividades
    if (this.actividades && this.actividades.length > 0) {
      const totalActividades = this.actividades.reduce(
        (sum, actividad) => sum + actividad.presupuestoAsignado, 
        0
      );

      if (totalActividades > this.presupuesto.total) {
        throw new Error('El presupuesto total de las actividades excede el presupuesto del proyecto');
      }

      this.actividades.forEach(actividad => {
        actividad.porcentajePresupuesto = 
          (actividad.presupuestoAsignado / this.presupuesto.total) * 100;
      });

      this.presupuesto.ejecutado = totalActividades;
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Exportar los modelos
module.exports = {
  ObjetivoGlobal: mongoose.model('ObjetivoGlobal', ObjetivoGlobalSchema),
  LineaEstrategica: mongoose.model('LineaEstrategica', LineaEstrategicaSchema),
  Proyecto: mongoose.model('Proyecto', ProyectoSchema)
};