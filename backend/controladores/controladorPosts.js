const asyncHandler = require('express-async-handler');
const Post = require('../modelos/ModeloPost');
const { crearNotificacion } = require('./controladorNotificaciones');

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

// GET /api/posts - Obtener feed personalizado
const obtenerPosts = asyncHandler(async (req, res) => {
    const Usuario = require('../modelos/modeloUsuarios');
    const usuarioActual = await Usuario.findById(req.usuario._id);
    
    // Obtener lista de usuarios bloqueados (tanto los que bloqueé como los que me bloquearon)
    const usuariosBloqueados = usuarioActual.usuariosBloqueados || [];
    // También excluir usuarios que me han bloqueado
    const usuariosQueMeBloquearon = await Usuario.find({ 
        usuariosBloqueados: req.usuario._id.toString() 
    }).select('_id');
    const idsUsuariosQueMeBloquearon = usuariosQueMeBloquearon.map(u => u._id.toString());
    const todosLosBloqueados = [...usuariosBloqueados, ...idsUsuariosQueMeBloquearon];
    
    let posts = [];

    // 1. Intentar posts de usuarios que sigue (excluyendo bloqueados)
    if (usuarioActual.siguiendo && usuarioActual.siguiendo.length > 0) {
        const siguiendoFiltrado = usuarioActual.siguiendo.filter(id => !todosLosBloqueados.includes(id.toString()));
        if (siguiendoFiltrado.length > 0) {
            posts = await Post.find({ autor: { $in: siguiendoFiltrado } })
                .populate('autor', 'nombre avatarUrl')
                .populate('comentarios.autor', 'nombre avatarUrl')
                .sort({ createdAt: -1 })
                .limit(50);
        }
    }

    // 2. Si no hay suficientes, agregar posts random (excluyendo los propios y bloqueados)
    if (posts.length < 10) {
        const randomPosts = await Post.find({ 
            autor: { 
                $ne: req.usuario._id,
                $nin: todosLosBloqueados.map(id => id.toString())
            },
            _id: { $nin: posts.map(p => p._id) }
        })
            .populate('autor', 'nombre avatarUrl')
            .populate('comentarios.autor', 'nombre avatarUrl')
            .sort({ createdAt: -1 })
            .limit(20);
        
        posts = [...posts, ...randomPosts];
    }

    // 3. Si aún no hay suficientes, agregar los propios
    if (posts.length < 5) {
        const ownPosts = await Post.find({ autor: req.usuario._id })
            .populate('autor', 'nombre avatarUrl')
            .populate('comentarios.autor', 'nombre avatarUrl')
            .sort({ createdAt: -1 })
            .limit(10);
        
        posts = [...posts, ...ownPosts];
    }

    // Filtrar posts de usuarios bloqueados (por si acaso)
    posts = posts.filter(post => {
        const autorId = post.autor._id.toString();
        return !todosLosBloqueados.includes(autorId);
    });

    // Eliminar duplicados y ordenar por fecha
    const uniquePosts = Array.from(new Map(posts.map(p => [p._id.toString(), p])).values());
    uniquePosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(uniquePosts.slice(0, 50));
});

// GET /api/posts/usuario/:userId - Obtener posts de un usuario
const obtenerPostsUsuario = asyncHandler(async (req, res) => {
    const Usuario = require('../modelos/modeloUsuarios');
    const usuarioActual = await Usuario.findById(req.usuario._id);
    const usuarioBuscadoId = req.params.userId;

    // Verificar si está bloqueado
    const estaBloqueado = usuarioActual.usuariosBloqueados && usuarioActual.usuariosBloqueados.includes(usuarioBuscadoId);
    const meBloquearon = await Usuario.findOne({ 
        _id: usuarioBuscadoId,
        usuariosBloqueados: req.usuario._id.toString()
    });

    if (estaBloqueado || meBloquearon) {
        res.status(403);
        throw new Error('No tienes acceso a estos posts');
    }

    const posts = await Post.find({ autor: usuarioBuscadoId })
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
        // Crear notificación
        await crearNotificacion(
            post.autor,
            req.usuario._id,
            'like',
            `${req.usuario.nombre} le dio like a tu post`,
            post._id
        );
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
    
    // Crear notificación
    await crearNotificacion(
        post.autor,
        req.usuario._id,
        'comentario',
        `${req.usuario.nombre} comentó en tu post`,
        post._id
    );
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
