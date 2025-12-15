const express = require('express');
const router = express.Router();
const {
    crearPost,
    obtenerPosts,
    obtenerPostsUsuario,
    obtenerPost,
    toggleLike,
    toggleDislike,
    crearComentario,
    toggleLikeComentario,
    toggleDislikeComentario,
} = require('../controladores/controladorPosts');
const { proteger } = require('../middleware/authMiddleware');

// Todas las rutas protegidas
router.post('/', proteger, crearPost);
router.get('/', proteger, obtenerPosts);
router.get('/usuario/:userId', proteger, obtenerPostsUsuario);
router.get('/:id', proteger, obtenerPost);
router.put('/:id/like', proteger, toggleLike);
router.put('/:id/dislike', proteger, toggleDislike);
router.post('/:id/comentarios', proteger, crearComentario);
router.put('/:postId/comentarios/:comentarioId/like', proteger, toggleLikeComentario);
router.put('/:postId/comentarios/:comentarioId/dislike', proteger, toggleDislikeComentario);

module.exports = router;
