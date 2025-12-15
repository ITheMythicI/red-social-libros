const express = require('express');
const router = express.Router();
const { 
    buscarLibros, 
    detalleLibro, 
    obtenerSugerencias, 
    obtenerBiografiaAutor, 
    obtenerDatosCuriosos 
} = require('../controladores/controladorLibros');
const { proteger } = require('../middleware/authMiddleware');

// Búsqueda pública
router.get('/', buscarLibros);

// Rutas protegidas específicas (deben ir antes de /:id)
router.get('/sugerencias/recomendaciones', proteger, obtenerSugerencias);
router.get('/autor/:nombre', proteger, obtenerBiografiaAutor);
router.get('/datos-curiosos/aleatorios', proteger, obtenerDatosCuriosos);

// Detalle (público) - debe ir al final para no capturar las rutas anteriores
router.get('/:id', detalleLibro);

module.exports = router;
