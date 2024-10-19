const Avance = require("../models/Avance");
const Usuario = require("../models/Usuario");

// Crear un nuevo avance para un usuario con rol 'usuario'
exports.crearAvance = async (req, res) => {
  const { usuarioId } = req.params;
  const {
    mes,
    año,
    estatura,
    pesokg,
    grasa,
    agua,
    musculo,
    edadMetabolica,
    grasaViseral,
  } = req.body;

  try {
    const usuario = await Usuario.findById(usuarioId);

    // Verifica que el usuario tenga el rol de "usuario"
    if (!usuario || usuario.rol !== "usuario") {
      return res.status(400).json({
        mensaje: "El ID proporcionado no corresponde a un usuario válido.",
      });
    }

    const nuevoAvance = new Avance({
      usuario: usuarioId,
      mes,
      año,
      estatura,
      pesokg,
      grasa,
      agua,
      musculo,
      edadMetabolica,
      grasaViseral,
    });

    await nuevoAvance.save();
    res.status(201).json({
      mensaje: "Avance creado exitosamente para el usuario",
      avance: nuevoAvance,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al crear el avance para el usuario",
      error: error.message,
    });
  }
};

// Obtener todos los avances de un usuario
exports.obtenerAvances = async (req, res) => {
  const { usuarioId } = req.params;

  try {
    const avances = await Avance.find({ usuario: usuarioId })
      .sort({ año: -1, mes: 1 })
      .exec();

    if (!avances || avances.length === 0) {
      return res.status(404).json({
        mensaje: "No se encontraron avances para este usuario.",
      });
    }

    res.json(avances);
  } catch (error) {
    res.status(500).json({
      mensaje: "Hubo un error al obtener los avances.",
      error: error.message,
    });
  }
};

// Obtener un avance específico de un usuario
exports.obtenerAvance = async (req, res) => {
  const { usuarioId, avanceId } = req.params;

  try {
    const avance = await Avance.findOne({ _id: avanceId, usuario: usuarioId })
      .lean()
      .exec();

    if (!avance) {
      return res
        .status(404)
        .json({ mensaje: "No se encontró el avance para este usuario" });
    }

    avance.imc = (avance.pesokg / avance.estatura ** 2).toFixed(2);

    res.status(200).json(avance);
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al obtener el avance del usuario",
      error: error.message,
    });
  }
};

// Actualizar un avance específico de un usuario
exports.actualizarAvance = async (req, res) => {
  const { usuarioId, avanceId } = req.params;

  try {
    const avance = await Avance.findOne({ _id: avanceId, usuario: usuarioId });
    if (!avance) {
      return res
        .status(404)
        .json({ mensaje: "No se encontró el avance para este usuario" });
    }

    const avanceActualizado = await Avance.findByIdAndUpdate(
      avanceId,
      req.body,
      { new: true }
    );

    res.status(200).json({
      mensaje: "Avance actualizado correctamente",
      avance: avanceActualizado,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al actualizar el avance del usuario",
      error: error.message,
    });
  }
};

// Eliminar un avance específico de un usuario
exports.eliminarAvance = async (req, res) => {
  const { usuarioId, avanceId } = req.params;

  try {
    const avance = await Avance.findOne({ _id: avanceId, usuario: usuarioId });
    if (!avance) {
      return res
        .status(404)
        .json({ mensaje: "No se encontró el avance para este usuario" });
    }

    await Avance.findByIdAndDelete(avanceId);

    res.status(200).json({ mensaje: "Avance eliminado correctamente" });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al eliminar el avance del usuario",
      error: error.message,
    });
  }
};
