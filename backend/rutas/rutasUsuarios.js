const express = require('express');
const router = express.Router();

const { 
    registroUsuario, 
    loginUsuario, 
    obtenerUsuarioActual,
    actualizarSubjectsFavoritos,
    actualizarLibrosFavoritos,
} = require('../controladores/controladorUsuarios');

const { proteger } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/', registroUsuario);
router.post('/login', loginUsuario);

// Rutas protegidas
router.get('/actual', proteger, obtenerUsuarioActual);
router.put('/subjects', proteger, actualizarSubjectsFavoritos);
router.put('/favoritos', proteger, actualizarLibrosFavoritos);

module.exports = router;
