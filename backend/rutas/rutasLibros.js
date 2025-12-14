const express = require('express');
const router = express.Router();
const { buscarLibros, detalleLibro } = require('../controladores/controladorLibros');

// Búsqueda pública
router.get('/', buscarLibros);

// Detalle (público)
router.get('/:id', detalleLibro);

module.exports = router;
