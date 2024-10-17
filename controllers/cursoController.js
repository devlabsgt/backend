const Curso = require("../models/curso");
const Estudiante = require("../models/estudiante");

// Crear un nuevo curso
exports.crearCurso = async (req, res) => {
  try {
    const curso = new Curso(req.body); // Crear un nuevo curso con los datos del request
    await curso.save(); // Guardar en la base de datos
    res.status(201).json(curso); // Enviar la respuesta con el curso creado
  } catch (error) {
    console.error("Error al crear el curso:", error);
    res.status(500).json({ mensaje: "Hubo un error al crear el curso" });
  }
};
// Obtener todos los cursos
exports.obtenerCursos = async (req, res) => {
  try {
    const cursos = await Curso.find(); // Buscar todos los cursos
    res.status(200).json(cursos); // Enviar la respuesta con los cursos
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    res.status(500).json({ mensaje: "Hubo un error al obtener los cursos" });
  }
};
// Obtener un curso por su ID
exports.obtenerCurso = async (req, res) => {
  try {
    const curso = await Curso.findById(req.params.id); // Buscar el curso por ID
    if (!curso) {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
    }
    res.status(200).json(curso); // Enviar la respuesta con el curso
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ mensaje: "Hubo un error al obtener el curso" });
  }
};
// Actualizar un curso por su ID
exports.actualizarCurso = async (req, res) => {
  try {
    const curso = await Curso.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Devuelve el curso actualizado
    );
    if (!curso) {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
    }
    res.status(200).json(curso); // Enviar la respuesta con el curso actualizado
  } catch (error) {
    console.error("Error al actualizar el curso:", error);
    res.status(500).json({ mensaje: "Hubo un error al actualizar el curso" });
  }
};
exports.eliminarCurso = async (req, res) => {
  try {
    const cursoId = req.params.id;

    // Eliminar la referencia del curso de todos los estudiantes
    await Estudiante.updateMany(
      { cursoAsignado: cursoId }, // Busca estudiantes con el curso asignado
      { $pull: { cursoAsignado: cursoId } } // Elimina el curso del array cursoAsignado
    );

    // Ahora sí, eliminar el curso
    const cursoEliminado = await Curso.findByIdAndDelete(cursoId);

    if (!cursoEliminado) {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
    }

    res.status(200).json({ mensaje: "Curso eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el curso:", error);
    res.status(500).json({ mensaje: "Hubo un error al eliminar el curso" });
  }
};
// Obtener los estudiantes asignados a un curso por su ID
exports.obtenerEstudiantesAsignadosCurso = async (req, res) => {
  try {
    const estudiantes = await Estudiante.find({ cursoAsignado: req.params.id }); // Buscar estudiantes por el curso asignado
    if (!estudiantes.length) {
      return res
        .status(404)
        .json({ mensaje: "No hay estudiantes asignados a este curso" });
    }
    res.status(200).json(estudiantes); // Devuelve la lista de estudiantes
  } catch (error) {
    console.error(
      "Error al obtener los estudiantes asignados al curso:",
      error
    );
    res
      .status(500)
      .json({ mensaje: "Hubo un error al obtener los estudiantes asignados" });
  }
};
