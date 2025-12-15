const asyncHandler = require('express-async-handler');
const Post = require('../modelos/ModeloPost');

// POST /api/posts - Crear post
const crearPost = asyncHandler(async (req, res) => {
    const { texto, libro } = req.body;

    if (!texto || !texto.trim()) {
        res.status(400);
        throw new Error('El texto del post es requerido');
    }

    const post = await Post.create({
        autor: req.usuario._id,
        texto: texto.trim(),
        libro: libro || null,
    });

    const populated = await Post.findById(post._id).populate('autor', 'nombre avatarUrl');
    res.status(201).json(populated);
});

// GET /api/posts - Obtener todos los posts (feed)
const obtenerPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find()
        .populate('autor', 'nombre avatarUrl')
        .populate('comentarios.autor', 'nombre avatarUrl')
        .sort({ createdAt: -1 })
        .limit(50);
    res.json(posts);
});

// GET /api/posts/usuario/:userId - Obtener posts de un usuario
const obtenerPostsUsuario = asyncHandler(async (req, res) => {
    const posts = await Post.find({ autor: req.params.userId })
        .populate('autor', 'nombre avatarUrl')
        .populate('comentarios.autor', 'nombre avatarUrl')
        .sort({ createdAt: -1 });
    res.json(posts);
});

// GET /api/posts/:id - Obtener un post
const obtenerPost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate('autor', 'nombre avatarUrl')
        .populate('comentarios.autor', 'nombre avatarUrl');

    if (!post) {
        res.status(404);
        throw new Error('Post no encontrado');
    }

    res.json(post);
});

// PUT /api/posts/:id/like - Dar/quitar like
const toggleLike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post no encontrado');
    }

    const userId = req.usuario._id.toString();
    const hasLiked = post.likes.some((id) => id.toString() === userId);
    const hasDisliked = post.dislikes.some((id) => id.toString() === userId);

    if (hasDisliked) {
        post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
    }

    if (hasLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
        post.likes.push(req.usuario._id);
    }

    await post.save();
    const populated = await Post.findById(post._id)
        .populate('autor', 'nombre avatarUrl')
        .populate('comentarios.autor', 'nombre avatarUrl');
    res.json(populated);
});

// PUT /api/posts/:id/dislike - Dar/quitar dislike
const toggleDislike = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post no encontrado');
    }

    const userId = req.usuario._id.toString();
    const hasLiked = post.likes.some((id) => id.toString() === userId);
    const hasDisliked = post.dislikes.some((id) => id.toString() === userId);

    if (hasLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
    }

    if (hasDisliked) {
        post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);
    } else {
        post.dislikes.push(req.usuario._id);
    }

    await post.save();
    const populated = await Post.findById(post._id)
        .populate('autor', 'nombre avatarUrl')
        .populate('comentarios.autor', 'nombre avatarUrl');
    res.json(populated);
});

// POST /api/posts/:id/comentarios - Crear comentario
const crearComentario = asyncHandler(async (req, res) => {
    const { texto } = req.body;

    if (!texto || !texto.trim()) {
        res.status(400);
        throw new Error('El texto del comentario es requerido');
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post no encontrado');
    }

    post.comentarios.push({
        autor: req.usuario._id,
        texto: texto.trim(),
    });

    await post.save();
    const populated = await Post.findById(post._id)
        .populate('autor', 'nombre avatarUrl')
        .populate('comentarios.autor', 'nombre avatarUrl');
    res.json(populated);
});

// PUT /api/posts/:postId/comentarios/:comentarioId/like - Like a comentario
const toggleLikeComentario = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
        res.status(404);
        throw new Error('Post no encontrado');
    }

    const comentario = post.comentarios.id(req.params.comentarioId);

    if (!comentario) {
        res.status(404);
        throw new Error('Comentario no encontrado');
    }

    const userId = req.usuario._id.toString();
    const hasLiked = comentario.likes.some((id) => id.toString() === userId);
    const hasDisliked = comentario.dislikes.some((id) => id.toString() === userId);

    if (hasDisliked) {
        comentario.dislikes = comentario.dislikes.filter((id) => id.toString() !== userId);
    }

    if (hasLiked) {
        comentario.likes = comentario.likes.filter((id) => id.toString() !== userId);
    } else {
        comentario.likes.push(req.usuario._id);
    }

    await post.save();
    const populated = await Post.findById(post._id)
        .populate('autor', 'nombre avatarUrl')
        .populate('comentarios.autor', 'nombre avatarUrl');
    res.json(populated);
});

// PUT /api/posts/:postId/comentarios/:comentarioId/dislike - Dislike a comentario
const toggleDislikeComentario = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.postId);

    if (!post) {
        res.status(404);
        throw new Error('Post no encontrado');
    }

    const comentario = post.comentarios.id(req.params.comentarioId);

    if (!comentario) {
        res.status(404);
        throw new Error('Comentario no encontrado');
    }

    const userId = req.usuario._id.toString();
    const hasLiked = comentario.likes.some((id) => id.toString() === userId);
    const hasDisliked = comentario.dislikes.some((id) => id.toString() === userId);

    if (hasLiked) {
        comentario.likes = comentario.likes.filter((id) => id.toString() !== userId);
    }

    if (hasDisliked) {
        comentario.dislikes = comentario.dislikes.filter((id) => id.toString() !== userId);
    } else {
        comentario.dislikes.push(req.usuario._id);
    }

    await post.save();
    const populated = await Post.findById(post._id)
        .populate('autor', 'nombre avatarUrl')
        .populate('comentarios.autor', 'nombre avatarUrl');
    res.json(populated);
});

module.exports = {
    crearPost,
    obtenerPosts,
    obtenerPostsUsuario,
    obtenerPost,
    toggleLike,
    toggleDislike,
    crearComentario,
    toggleLikeComentario,
    toggleDislikeComentario,
};
