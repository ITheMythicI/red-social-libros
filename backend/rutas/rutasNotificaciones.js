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
router.get('/', proteger, obtenerNotificaciones);
router.get('/no-leidas', proteger, contarNoLeidas);
router.put('/:id/leer', proteger, marcarComoLeida);
router.put('/leer-todas', proteger, marcarTodasLeidas);
router.delete('/:id', proteger, eliminarNotificacion);
router.delete('/eliminar-todas/todas', proteger, eliminarTodasNotificaciones);

module.exports = router;

