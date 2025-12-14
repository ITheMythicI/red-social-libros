const express = require("express");
const router = express.Router();
const { proteger } = require("../middleware/authMiddleware");

const {
  crearTarea,
  obtenerTareas,
  actualizarTarea,
  eliminarTarea
} = require("../controladores/controladorTareas");

// Crear tarea
router.post("/", proteger, crearTarea);

// Obtener tareas
router.get("/", proteger, obtenerTareas);

// Actualizar tarea
router.put("/:id", proteger, actualizarTarea);

// Eliminar tarea
router.delete("/:id", proteger, eliminarTarea);

module.exports = router;

