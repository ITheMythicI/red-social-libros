const express = require('express');
const router = express.Router();
const {
    obtenerNotificaciones,
    contarNoLeidas,
    marcarComoLeida,
    marcarTodasLeidas,
    eliminarNotificacion,
    eliminarTodasNotificaciones
} = require('../controladores/controladorNotificaciones');
const { proteger } = require('../middleware/authMiddleware');

// Todas las rutas protegidas
// IMPORTANTE: Rutas específicas ANTES de rutas con parámetros dinámicos
router.get('/', proteger, obtenerNotificaciones);
router.get('/no-leidas', proteger, contarNoLeidas);
router.put('/leer-todas', proteger, marcarTodasLeidas);
router.delete('/eliminar-todas/todas', proteger, eliminarTodasNotificaciones);
router.put('/:id/leer', proteger, marcarComoLeida);
router.delete('/:id', proteger, eliminarNotificacion);

module.exports = router;

