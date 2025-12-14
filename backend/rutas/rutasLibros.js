const express = require('express');
const router = express.Router();

const { buscarLibros, detalleLibro } = require('../controladores/controladorLibros');
const { proteger } = require('../middleware/authMiddleware');

// Búsqueda pública
router.get('/', buscarLibros);

// Detalle (público)
router.get('/:id', detalleLibro);

module.exports = router;
const express = require('express');
const router = express.Router();
const { buscarLibros, obtenerLibro } = require('../controladores/controladorLibros');

router.get('/', buscarLibros);
router.get('/:id', obtenerLibro);

module.exports = router;
