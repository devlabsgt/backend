const express = require("express");
const router = express.Router();
const {
  Proyecto,
  ObjetivoGlobal,
  LineaEstrategica,
  ActividadPrincipal,
} = require("../models/Proyecto");
const Beneficiario = require("../models/Beneficiario");
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const auth = require("../middleware/auth");
const vRol = require("../middleware/vRol");
const {
  upload,
  validateUploadedFiles,
  handleUploadError,
} = require("../middleware/uploadMiddleware");
const fs = require("fs").promises;

// Configuración de la zona horaria de Guatemala
moment.tz.setDefault("America/Guatemala");

// Función para generar número de proyecto (formato: YYYY-001)
const generarNumeroProyecto = async () => {
  try {
    const year = new Date().getFullYear();

    // Buscar el último proyecto del año actual
    const ultimoProyecto = await Proyecto.findOne(
      { numero: new RegExp(`^${year}-`) }, // Busca números que empiecen con el año actual
      {},
      { sort: { numero: -1 } }
    );

    let numeroSecuencial = 1;

    if (ultimoProyecto && ultimoProyecto.numero) {
      // Extraer el número después del guion
      const partes = ultimoProyecto.numero.split("-");
      if (partes.length === 2) {
        numeroSecuencial = parseInt(partes[1]) + 1;
      }
    }

    // Formatear el número con padding de ceros (001, 002, etc.)
    const numeroFormateado = numeroSecuencial.toString().padStart(3, "0");
    const numeroProyecto = `${year}-${numeroFormateado}`;

    console.log(`Generando nuevo número de proyecto: ${numeroProyecto}`);
    return numeroProyecto;
  } catch (error) {
    console.error("Error al generar número de proyecto:", error);
    throw new Error("Error al generar número de proyecto");
  }
};

const generarCodigo = () => {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numeros = "0123456789";
  let codigo = "";

  // Generar 3 letras aleatorias
  for (let i = 0; i < 3; i++) {
    codigo += letras.charAt(Math.floor(Math.random() * letras.length));
  }

  // Agregar guion
  codigo += "-";

  // Generar 3 números aleatorios
  for (let i = 0; i < 3; i++) {
    codigo += numeros.charAt(Math.floor(Math.random() * numeros.length));
  }

  return codigo;
};

// CRUD para Objetivos Globales
router.post(
  "/objetivo-global",
  // auth, vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      const objetivo = new ObjetivoGlobal(req.body);
      await objetivo.save();
      res.status(201).json(objetivo);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error al crear el objetivo global", error });
    }
  }
);

router.get(
  "/objetivo-global",
  // auth,
  async (req, res) => {
    try {
      const objetivos = await ObjetivoGlobal.find();
      res.status(200).json(objetivos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los objetivos globales", error });
    }
  }
);

// CRUD para Líneas Estratégicas
router.post(
  "/linea-estrategica",
  // auth, vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      const linea = new LineaEstrategica(req.body);
      await linea.save();
      res.status(201).json(linea);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error al crear la línea estratégica", error });
    }
  }
);

router.get(
  "/linea-estrategica",
  // auth,
  async (req, res) => {
    try {
      const lineas = await LineaEstrategica.find();
      res.status(200).json(lineas);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener las líneas estratégicas", error });
    }
  }
);

// CRUD para Actividades Principales
router.post(
  "/actividad-principal",
  // auth, vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      const actividad = new ActividadPrincipal(req.body);
      await actividad.save();
      res.status(201).json(actividad);
    } catch (error) {
      res
        .status(400)
        .json({ message: "Error al crear la actividad principal", error });
    }
  }
);

router.get(
  "/actividad-principal",
  // auth,
  async (req, res) => {
    try {
      const actividades = await ActividadPrincipal.find();
      res.status(200).json(actividades);
    } catch (error) {
      res
        .status(500)
        .json({
          message: "Error al obtener las actividades principales",
          error,
        });
    }
  }
);

// Crear un nuevo proyecto
router.post(
  "/proyecto/crear",
  // auth,
  // vRol(["Administrador", "Super"]),
  upload.array("evidencias", 10),
  validateUploadedFiles,
  handleUploadError,
  async (req, res) => {
    try {
      const path = require("path");

      // Parsear los campos JSON que vienen del frontend
      const datosProyecto = {
        ...req.body,
        encargado: req.body.encargado,
        donantes: Array.isArray(req.body.donantes)
          ? req.body.donantes
          : JSON.parse(req.body.donantes || "[]"),
        lugaresAPriorizar: Array.isArray(req.body.lugaresAPriorizar)
          ? req.body.lugaresAPriorizar
          : JSON.parse(req.body.lugaresAPriorizar || "[]"),
        objetivosGlobales: Array.isArray(req.body.objetivosGlobales)
          ? req.body.objetivosGlobales
          : JSON.parse(req.body.objetivosGlobales || "[]"),
        lineasEstrategicas: Array.isArray(req.body.lineasEstrategicas)
          ? req.body.lineasEstrategicas
          : JSON.parse(req.body.lineasEstrategicas || "[]"),
        beneficiarios: Array.isArray(req.body.beneficiarios)
          ? req.body.beneficiarios
          : JSON.parse(req.body.beneficiarios || "[]"),
        seguimiento:
          typeof req.body.seguimiento === "object"
            ? req.body.seguimiento
            : JSON.parse(req.body.seguimiento || "{}"),
        presupuesto: Number(req.body.presupuesto),
        nivelAvance: Number(req.body.nivelAvance || 0),
        personasAlcanzadas: Number(req.body.personasAlcanzadas || 0),
      };

      console.log("Datos recibidos:", datosProyecto);

      // Validaciones
      if (!datosProyecto.nombre)
        throw new Error("El nombre del proyecto es requerido");
      if (!datosProyecto.encargado)
        throw new Error("El encargado es requerido");
      if (!datosProyecto.presupuesto)
        throw new Error("El presupuesto es requerido");
      if (!datosProyecto.fechaInicio)
        throw new Error("La fecha de inicio es requerida");
      if (!datosProyecto.fechaFinal)
        throw new Error("La fecha final es requerida");

      // Generar número y código de proyecto
      const [numeroProyecto, codigoProyecto] = await Promise.all([
        generarNumeroProyecto(),
        generarCodigo(),
      ]);

      const proyecto = new Proyecto({
        ...datosProyecto,
        numero: numeroProyecto,
        codigo: codigoProyecto,
        estado: "Activo",
      });

      // Procesar evidencias si existen
      if (req.files?.length > 0) {
        const proyectoDir = path.join(
          process.cwd(),
          "uploads",
          "proyectos",
          proyecto._id.toString()
        );
        await fs.mkdir(proyectoDir, { recursive: true });

        const evidencias = await Promise.all(
          req.files.map(async (file) => {
            const newPath = path.join(proyectoDir, path.basename(file.path));
            await fs.rename(file.path, newPath);

            return {
              tipo: file.mimetype.startsWith("image/") ? "imagen" : "documento",
              archivo: newPath,
              descripcion: file.originalname,
              fechaSubida: new Date(),
            };
          })
        );

        proyecto.evidencias = evidencias;
      }

      await proyecto.save();

      const proyectoPopulado = await proyecto.populate([
        { path: "encargado" },
        { path: "donantes.donante" },
        { path: "objetivosGlobales" },
        { path: "lineasEstrategicas" },
        { path: "actividadesPrincipales" },
      ]);

      res.status(201).json({
        message: "Proyecto creado exitosamente",
        proyecto: proyectoPopulado,
      });
    } catch (error) {
      console.error("Error al crear proyecto:", error);

      // Limpiar archivos en caso de error
      if (req.files) {
        await Promise.all(
          req.files.map((file) => fs.unlink(file.path).catch(() => {}))
        );
      }

      res.status(400).json({
        message: "Error al crear el proyecto",
        error: error.message,
      });
    }
  }
);

// Obtener todos los proyectos con población completa
router.get(
  "/proyecto",
  // auth,
  async (req, res) => {
    try {
      const proyectos = await Proyecto.find()
        .populate("encargado")
        .populate("donantes.donante")
        .populate("objetivosGlobales")
        .populate("lineasEstrategicas")
        .populate("actividadesPrincipales");

      res.status(200).json(proyectos);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error al obtener los proyectos", error });
    }
  }
);

// Obtener un proyecto por ID con población completa
router.get("/proyecto/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        message: "ID de proyecto inválido",
        error: "ID_INVALIDO"
      });
    }

    const proyecto = await Proyecto.findById(id)
      .populate("encargado")
      .populate("donantes.donante")
      .populate("objetivosGlobales")
      .populate("lineasEstrategicas")
      .populate({
        path: "beneficiarios.beneficiario",
        model: "Beneficiario",
      });

    if (!proyecto) {
      return res.status(404).json({ 
        message: "Proyecto no encontrado",
        error: "PROYECTO_NO_ENCONTRADO" 
      });
    }

    res.status(200).json(proyecto);
  } catch (error) {
    console.error("Error al obtener el proyecto:", error);
    res.status(500).json({ 
      message: "Error al obtener el proyecto",
      error: error.message,
      details: error.stack
    });
  }
});

// Actualizar proyecto
router.put(
  "/proyecto/:id",
  // auth, vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      const actualizaciones = req.body;

      // Evitar la modificación del número de proyecto y código
      delete actualizaciones.numero;
      delete actualizaciones.codigo;

      // Asegurar que los campos de referencia sean ObjectId válidos
      if (actualizaciones.encargado) {
        actualizaciones.encargado = mongoose.Types.ObjectId(
          actualizaciones.encargado
        );
      }

      if (actualizaciones.beneficiarios) {
        actualizaciones.beneficiarios = actualizaciones.beneficiarios.map(
          (b) => ({
            ...b,
            beneficiario: mongoose.Types.ObjectId(b.beneficiario),
          })
        );
      }

      if (actualizaciones.donantes) {
        actualizaciones.donantes = actualizaciones.donantes.map((d) => ({
          ...d,
          donante: mongoose.Types.ObjectId(d.donante),
        }));
      }

      const proyecto = await Proyecto.findByIdAndUpdate(
        req.params.id,
        { $set: actualizaciones },
        {
          new: true,
          runValidators: true,
        }
      ).populate([
        "encargado",
        "donantes.donante",
        "objetivosGlobales",
        "lineasEstrategicas",
        "beneficiarios.beneficiario",
      ]);

      if (!proyecto) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }

      res.status(200).json(proyecto);
    } catch (error) {
      console.error("Error al actualizar proyecto:", error);
      res.status(400).json({
        message: "Error al actualizar el proyecto",
        error: error.message,
      });
    }
  }
);

// Subir evidencia
router.post(
  "/proyecto/:id/evidencias",
  // auth,
  // vRol(["Administrador", "Super", "Encargado"]),
  upload.array("evidencias", 10),
  validateUploadedFiles,
  handleUploadError,
  async (req, res) => {
    try {
      const path = require("path");
      const proyecto = await Proyecto.findById(req.params.id);
      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      // Crear directorio para el proyecto si no existe
      const proyectoDir = path.join(
        process.cwd(),
        "uploads",
        "proyectos",
        proyecto._id.toString()
      );
      await fs.mkdir(proyectoDir, { recursive: true });

      // Procesar los archivos
      const nuevasEvidencias = await Promise.all(
        req.files.map(async (file) => {
          const newPath = path.join(proyectoDir, path.basename(file.path));
          await fs.rename(file.path, newPath);

          return {
            _id: new mongoose.Types.ObjectId(), // Generar un nuevo ID para cada evidencia
            tipo: file.mimetype.startsWith("image/") ? "imagen" : "documento",
            archivo: newPath,
            descripcion: file.originalname,
            fechaSubida: new Date(),
          };
        })
      );

      // Agregar las nuevas evidencias al proyecto
      proyecto.evidencias.push(...nuevasEvidencias);
      await proyecto.save();

      res.status(201).json({
        message: "Evidencias agregadas correctamente",
        evidencias: nuevasEvidencias.map((evidencia) => ({
          ...evidencia,
          id: evidencia._id, // Asegurar que el ID esté disponible
        })),
      });
    } catch (error) {
      // Limpiar archivos en caso de error
      if (req.files) {
        await Promise.all(
          req.files.map((file) => fs.unlink(file.path).catch(() => {}))
        );
      }

      res.status(error.message === "Proyecto no encontrado" ? 404 : 500).json({
        message: "Error al subir evidencias",
        error: error.message,
      });
    }
  }
);

// Eliminar evidencia
router.delete(
  "/proyecto/:id/evidencias/:evidenciaId",
  auth,
  vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      const proyecto = await Proyecto.findById(req.params.id);
      if (!proyecto) {
        throw new Error("Proyecto no encontrado");
      }

      const evidencia = proyecto.evidencias.id(req.params.evidenciaId);
      if (!evidencia) {
        throw new Error("Evidencia no encontrada");
      }

      // Eliminar archivo físico
      await fs.unlink(evidencia.archivo);

      // Eliminar referencia de la base de datos
      proyecto.evidencias.pull(req.params.evidenciaId);
      await proyecto.save();

      res.json({ message: "Evidencia eliminada correctamente" });
    } catch (error) {
      res.status(error.message.includes("no encontrad") ? 404 : 500).json({
        message: "Error al eliminar evidencia",
        error: error.message,
      });
    }
  }
);

router.put(
  "/proyecto/:id/estado",
  // auth, vRol(["Administrador", "Super"]),
  async (req, res) => {
    try {
      const { estado } = req.body;

      const proyecto = await Proyecto.findByIdAndUpdate(
        req.params.id,
        { $set: { estado } },
        { new: true }
      ).populate([
        "encargado",
        "donantes.donante",
        "objetivosGlobales",
        "lineasEstrategicas",
        "beneficiarios.beneficiario",
      ]);

      if (!proyecto) {
        return res.status(404).json({ message: "Proyecto no encontrado" });
      }

      res.status(200).json(proyecto);
    } catch (error) {
      console.error("Error al actualizar estado del proyecto:", error);
      res.status(400).json({
        message: "Error al actualizar el estado del proyecto",
        error: error.message,
      });
    }
  }
);

module.exports = router;
