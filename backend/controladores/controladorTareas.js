const Tareas = require("../modelos/ModeloTareas");

// Crear tarea
exports.crearTarea = async (req, res) => {
  try {
    const tarea = new Tareas({
      titulo: req.body.titulo,
      descripcion: req.body.descripcion,
      usuario: req.usuario.id
    });

    const nuevaTarea = await tarea.save();
    res.status(201).json(nuevaTarea);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear tarea", error: error.message });
  }
};

// Obtener todas las tareas del usuario
exports.obtenerTareas = async (req, res) => {
  try {
    const tareas = await Tareas.find({ usuario: req.usuario.id }).sort({ fechaCreacion: -1 });
    res.json(tareas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener tareas", error: error.message });
  }
};

// Actualizar tarea
exports.actualizarTarea = async (req, res) => {
  try {
    const { id } = req.params;

    let tarea = await Tareas.findById(id);
    if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });

    if (tarea.usuario.toString() !== req.usuario.id)
      return res.status(403).json({ mensaje: "No autorizado" });

    tarea = await Tareas.findByIdAndUpdate(id, req.body, { new: true });
    res.json(tarea);

  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar tarea", error: error.message });
  }
};

// Eliminar tarea
exports.eliminarTarea = async (req, res) => {
  try {
    const { id } = req.params;

    const tarea = await Tareas.findById(id);
    if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });

    if (tarea.usuario.toString() !== req.usuario.id)
      return res.status(403).json({ mensaje: "No autorizado" });

    await tarea.deleteOne();
    res.json({ mensaje: "Tarea eliminada" });

  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar tarea", error: error.message });
  }
};
