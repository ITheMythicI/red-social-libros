const express = require('express');
const router = express.Router();

const { 
    registroUsuario, 
    loginUsuario, 
    obtenerUsuarioActual,
    obtenerUsuarioPorId,
    actualizarSubjectsFavoritos,
    actualizarLibrosFavoritos,
    actualizarAvatar,
    actualizarNombre,
    actualizarLibrosLeyendo,
    actualizarLibrosLeidos,
    seguirUsuario,
    bloquearUsuario,
} = require('../controladores/controladorUsuarios');

const { proteger } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/', registroUsuario);
router.post('/login', loginUsuario);

// Rutas protegidas
router.get('/actual', proteger, obtenerUsuarioActual);
router.put('/subjects', proteger, actualizarSubjectsFavoritos);
router.put('/favoritos', proteger, actualizarLibrosFavoritos);
router.put('/avatar', proteger, actualizarAvatar);
router.put('/nombre', proteger, actualizarNombre);
router.put('/leyendo', proteger, actualizarLibrosLeyendo);
router.put('/leidos', proteger, actualizarLibrosLeidos);
router.get('/:userId', proteger, obtenerUsuarioPorId);
router.put('/:userId/seguir', proteger, seguirUsuario);
router.put('/:userId/bloquear', proteger, bloquearUsuario);

module.exports = router;
