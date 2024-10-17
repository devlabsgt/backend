const Estudiante = require("../models/estudiante");

// Crear un nuevo estudiante
exports.crearEstudiante = async (req, res) => {
  try {
    const estudiante = new Estudiante(req.body); // Crear un nuevo estudiante con los datos del request
    await estudiante.save(); // Guardar en la base de datos
    res.status(201).json(estudiante); // Enviar la respuesta con el estudiante creado
  } catch (error) {
    console.error("Error al crear el estudiante:", error);
    res.status(500).json({ mensaje: "Hubo un error al crear el estudiante" });
  }
};

// Obtener todos los estudiantes
exports.obtenerEstudiantes = async (req, res) => {
  try {
    const estudiantes = await Estudiante.find().populate("cursoAsignado"); // Populamos el cursoAsignado
    res.json(estudiantes);
  } catch (error) {
    console.error("Error al obtener los estudiantes:", error);
    res.status(500).json({ message: "Error al obtener los estudiantes" });
  }
};

// Obtener un estudiante por su ID
exports.obtenerEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id).populate(
      "cursoAsignado"
    ); // Buscar el estudiante por ID
    if (!estudiante) {
      return res.status(404).json({ mensaje: "Estudiante no encontrado" });
    }
    res.status(200).json(estudiante); // Enviar la respuesta con el estudiante
  } catch (error) {
    console.error("Error al obtener el estudiante:", error);
    res.status(500).json({ mensaje: "Hubo un error al obtener el estudiante" });
  }
};

// Actualizar un estudiante por su ID (incluye actualizar los cursos asignados)
exports.actualizarEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findByIdAndUpdate(
      req.params.id,
      req.body, // Este cuerpo puede contener campos para actualizar, incluidos los cursos
      { new: true, runValidators: true }
    ).populate("cursoAsignado");

    if (!estudiante) {
      return res.status(404).json({ mensaje: "Estudiante no encontrado" });
    }
    res.status(200).json(estudiante); // Enviar la respuesta con el estudiante actualizado
  } catch (error) {
    console.error("Error al actualizar el estudiante:", error);
    res
      .status(500)
      .json({ mensaje: "Hubo un error al actualizar el estudiante" });
  }
};

// Eliminar un estudiante por su ID
exports.eliminarEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findByIdAndDelete(req.params.id); // Buscar y eliminar el estudiante
    if (!estudiante) {
      return res.status(404).json({ mensaje: "Estudiante no encontrado" });
    }
    res.status(200).json({ mensaje: "Estudiante eliminado correctamente" }); // Enviar respuesta exitosa
  } catch (error) {
    console.error("Error al eliminar el estudiante:", error);
    res
      .status(500)
      .json({ mensaje: "Hubo un error al eliminar el estudiante" });
  }
};

// Obtener el curso asignado a un estudiante por su ID
exports.obtenerCursoAsignadoEstudiante = async (req, res) => {
  try {
    const estudiante = await Estudiante.findById(req.params.id).populate(
      "cursoAsignado"
    ); // Popular los detalles del curso asignado
    if (!estudiante) {
      return res.status(404).json({ mensaje: "Estudiante no encontrado" });
    }
    res.status(200).json(estudiante.cursoAsignado); // Devuelve el curso asignado
  } catch (error) {
    console.error("Error al obtener el curso asignado al estudiante:", error);
    res
      .status(500)
      .json({ mensaje: "Hubo un error al obtener el curso asignado" });
  }
};
