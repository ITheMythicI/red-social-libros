const express = require('express');
const router = express.Router();

const { 
    registroUsuario, 
    loginUsuario, 
    obtenerUsuarioActual 
} = require('../controladores/controladorUsuarios');

const { proteger } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/', registroUsuario);
router.post('/login', loginUsuario);

// Rutas protegidas
router.get('/actual', proteger, obtenerUsuarioActual);

module.exports = router;
