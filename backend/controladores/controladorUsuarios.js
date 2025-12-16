const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usuario = require('../modelos/modeloUsuarios');
const { crearNotificacion } = require('./controladorNotificaciones');

const registroUsuario = asyncHandler(async (req, res) => {
    const { 
        nombre, 
        email, 
        password, 
        subjectsFavoritos = [], 
        librosFavoritos = [], 
        librosLeyendo = [], 
        librosLeidos = [], 
        seguidores = [],
        siguiendo = [],
        avatarUrl = '' 
    } = req.body;

    if (!nombre || !email || !password) {
        res.status(400);
        throw new Error('Todos los campos son requeridos');
    }

    const usuarioExistente = await usuario.findOne({ email });
    if (usuarioExistente) {
        res.status(400);
        throw new Error('El usuario ya existe');
    }
    //res.json({ mensaje: 'Usuario registrado satisfactoriamente' });

    const sal = await bcrypt.genSalt(10);
    const passwordEncriptado = await bcrypt.hash(password, sal);
    const user = await usuario.create({
        nombre,
        email,
        password: passwordEncriptado,
        subjectsFavoritos,
        librosFavoritos,
        librosLeyendo,
        librosLeidos,
        seguidores,
        siguiendo,
        avatarUrl,
    });

    if(!user){
        res.status(400);
        throw new Error('Datos de usuario no válidos');
    }else{
        res.status(201).json({
            _id: user.id,
            nombre: user.nombre,
            email: user.email,
            subjectsFavoritos: user.subjectsFavoritos,
            librosFavoritos: user.librosFavoritos,
            librosLeyendo: user.librosLeyendo,
            librosLeidos: user.librosLeidos,
            avatarUrl: user.avatarUrl,
            seguidores: user.seguidores,
            siguiendo: user.siguiendo,
            seguidoresCount: user.seguidores.length,
            siguiendoCount: user.siguiendo.length,
            token: generarTokenJWT(user._id)
        });
    }
});

const loginUsuario = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Faltan datos");
    }

    const user = await usuario.findOne({ email });

    // Validar usuario y password
    if (!user) {
        res.status(400);
        throw new Error("Credenciales inválidas");
    }

    const passwordCorrecto = await bcrypt.compare(password, user.password);

    if (!passwordCorrecto) {
        res.status(400);
        throw new Error("Credenciales inválidas");
    }

    // Todo OK → responder
    res.status(200).json({
        _id: user.id,
        nombre: user.nombre,
        email: user.email,
        subjectsFavoritos: user.subjectsFavoritos,
        librosFavoritos: user.librosFavoritos,
        librosLeyendo: user.librosLeyendo,
        librosLeidos: user.librosLeidos,
        avatarUrl: user.avatarUrl,
        seguidores: user.seguidores,
        siguiendo: user.siguiendo,
        seguidoresCount: user.seguidores.length,
        siguiendoCount: user.siguiendo.length,
        token: generarTokenJWT(user._id),
    });
});


const obtenerUsuarioActual = asyncHandler(async (req, res) => {
  res.json(req.usuario);
});

// GET /api/usuarios/me/contadores - Obtener solo contadores de seguidores/siguiendo
const obtenerContadores = asyncHandler(async (req, res) => {
    // Obtener el usuario fresco de la BD para tener los datos más actualizados
    const usuarioActualizado = await usuario.findById(req.usuario._id).select('seguidores siguiendo');
    
    res.json({
        seguidoresCount: usuarioActualizado.seguidores?.length || 0,
        siguiendoCount: usuarioActualizado.siguiendo?.length || 0
    });
});

// PUT /api/usuarios/subjects
const actualizarSubjectsFavoritos = asyncHandler(async (req, res) => {
    const { subjects } = req.body;

    if (!Array.isArray(subjects)) {
        res.status(400);
        throw new Error('El campo "subjects" debe ser un arreglo de strings');
    }

    const limpio = subjects
        .map((s) => (s || '').toString().trim())
        .filter((s) => s.length > 0);

    req.usuario.subjectsFavoritos = limpio;
    await req.usuario.save();

    res.json({
        _id: req.usuario.id,
        nombre: req.usuario.nombre,
        email: req.usuario.email,
        subjectsFavoritos: req.usuario.subjectsFavoritos,
        librosFavoritos: req.usuario.librosFavoritos,
        librosLeyendo: req.usuario.librosLeyendo,
        librosLeidos: req.usuario.librosLeidos,
        avatarUrl: req.usuario.avatarUrl,
    });
});

const limpiarLibros = (libros = []) =>
    libros
        .map((libro) => ({
            bookId: (libro.bookId || '').toString(),
            titulo: (libro.titulo || '').toString(),
            autores: Array.isArray(libro.autores) ? libro.autores.map((a) => a.toString()) : [],
            portada: libro.portada ? libro.portada.toString() : '',
        }))
        .filter((libro) => libro.bookId && libro.titulo);

const responderUsuario = (usuarioDoc, res, incluirEmail = false) => {
    const respuesta = {
        _id: usuarioDoc.id,
        nombre: usuarioDoc.nombre,
        subjectsFavoritos: usuarioDoc.subjectsFavoritos,
        librosFavoritos: usuarioDoc.librosFavoritos,
        librosLeyendo: usuarioDoc.librosLeyendo,
        librosLeidos: usuarioDoc.librosLeidos,
        avatarUrl: usuarioDoc.avatarUrl,
        seguidores: usuarioDoc.seguidores,
        siguiendo: usuarioDoc.siguiendo,
        seguidoresCount: usuarioDoc.seguidores.length,
        siguiendoCount: usuarioDoc.siguiendo.length,
    };
    if (incluirEmail) {
        respuesta.email = usuarioDoc.email;
    }
    res.json(respuesta);
};

// PUT /api/usuarios/favoritos
const actualizarLibrosFavoritos = asyncHandler(async (req, res) => {
    const { libros } = req.body;

    if (!Array.isArray(libros)) {
        res.status(400);
        throw new Error('El campo "libros" debe ser un arreglo de objetos');
    }

    req.usuario.librosFavoritos = limpiarLibros(libros);
    await req.usuario.save();

    responderUsuario(req.usuario, res);
});

// PUT /api/usuarios/leyendo
const actualizarLibrosLeyendo = asyncHandler(async (req, res) => {
    const { libros } = req.body;
    if (!Array.isArray(libros)) {
        res.status(400);
        throw new Error('El campo "libros" debe ser un arreglo de objetos');
    }
    req.usuario.librosLeyendo = limpiarLibros(libros);
    await req.usuario.save();
    responderUsuario(req.usuario, res);
});

// PUT /api/usuarios/leidos
const actualizarLibrosLeidos = asyncHandler(async (req, res) => {
    const { libros } = req.body;
    if (!Array.isArray(libros)) {
        res.status(400);
        throw new Error('El campo "libros" debe ser un arreglo de objetos');
    }
    req.usuario.librosLeidos = limpiarLibros(libros);
    await req.usuario.save();
    responderUsuario(req.usuario, res);
});

// PUT /api/usuarios/avatar
const actualizarAvatar = asyncHandler(async (req, res) => {
    const { avatarUrl } = req.body;

    if (typeof avatarUrl !== 'string') {
        res.status(400);
        throw new Error('El campo "avatarUrl" debe ser un string');
    }

    req.usuario.avatarUrl = avatarUrl.trim();
    await req.usuario.save();

    responderUsuario(req.usuario, res);
});

// PUT /api/usuarios/nombre
const actualizarNombre = asyncHandler(async (req, res) => {
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) {
        res.status(400);
        throw new Error('El nombre es requerido');
    }
    req.usuario.nombre = nombre.trim();
    await req.usuario.save();
    responderUsuario(req.usuario, res);
});

// GET /api/usuarios/:userId - Obtener perfil de otro usuario
const obtenerUsuarioPorId = asyncHandler(async (req, res) => {
    const usuarioBuscado = await usuario.findById(req.params.userId);
    
    if (!usuarioBuscado) {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }

    // Verificar si el usuario actual está bloqueado por el usuario buscado
    const usuarioActual = req.usuario;
    if (usuarioBuscado.usuariosBloqueados && usuarioBuscado.usuariosBloqueados.includes(usuarioActual._id.toString())) {
        res.status(403);
        throw new Error('No tienes acceso a este perfil');
    }

    // Verificar si el usuario buscado está bloqueado por el usuario actual
    const estaBloqueado = usuarioActual.usuariosBloqueados && usuarioActual.usuariosBloqueados.includes(usuarioBuscado._id.toString());
    
    // Verificar si el usuario actual sigue al usuario buscado
    const estaSiguiendo = usuarioActual.siguiendo && usuarioActual.siguiendo.includes(usuarioBuscado._id.toString());

    const respuesta = {
        _id: usuarioBuscado.id,
        nombre: usuarioBuscado.nombre,
        subjectsFavoritos: usuarioBuscado.subjectsFavoritos,
        librosFavoritos: usuarioBuscado.librosFavoritos,
        librosLeyendo: usuarioBuscado.librosLeyendo,
        librosLeidos: usuarioBuscado.librosLeidos,
        avatarUrl: usuarioBuscado.avatarUrl,
        seguidores: usuarioBuscado.seguidores,
        siguiendo: usuarioBuscado.siguiendo,
        seguidoresCount: usuarioBuscado.seguidores.length,
        siguiendoCount: usuarioBuscado.siguiendo.length,
        estaSiguiendo: estaSiguiendo,
        estaBloqueado: estaBloqueado,
    };

    res.json(respuesta);
});

// PUT /api/usuarios/:userId/seguir - Seguir/dejar de seguir usuario
const seguirUsuario = asyncHandler(async (req, res) => {
    const usuarioActual = req.usuario;
    const usuarioId = req.params.userId;

    if (usuarioActual._id.toString() === usuarioId) {
        res.status(400);
        throw new Error('No puedes seguirte a ti mismo');
    }

    const usuarioASeguir = await usuario.findById(usuarioId);
    if (!usuarioASeguir) {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }

    // Verificar si está bloqueado
    if (usuarioActual.usuariosBloqueados && usuarioActual.usuariosBloqueados.includes(usuarioId)) {
        res.status(403);
        throw new Error('No puedes seguir a un usuario bloqueado');
    }

    if (usuarioASeguir.usuariosBloqueados && usuarioASeguir.usuariosBloqueados.includes(usuarioActual._id.toString())) {
        res.status(403);
        throw new Error('Este usuario te ha bloqueado');
    }

    const estaSiguiendo = usuarioActual.siguiendo && usuarioActual.siguiendo.includes(usuarioId);

    if (estaSiguiendo) {
        // Dejar de seguir
        usuarioActual.siguiendo = usuarioActual.siguiendo.filter(id => id.toString() !== usuarioId);
        usuarioASeguir.seguidores = usuarioASeguir.seguidores.filter(id => id.toString() !== usuarioActual._id.toString());
    } else {
        // Seguir
        if (!usuarioActual.siguiendo) {
            usuarioActual.siguiendo = [];
        }
        if (!usuarioASeguir.seguidores) {
            usuarioASeguir.seguidores = [];
        }
        usuarioActual.siguiendo.push(usuarioId);
        usuarioASeguir.seguidores.push(usuarioActual._id.toString());
        
        // Crear notificación
        await crearNotificacion(
            usuarioId,
            usuarioActual._id,
            'seguidor',
            `${usuarioActual.nombre} comenzó a seguirte`
        );
    }

    await usuarioActual.save();
    await usuarioASeguir.save();

    res.json({
        estaSiguiendo: !estaSiguiendo,
        mensaje: estaSiguiendo ? 'Dejaste de seguir al usuario' : 'Ahora sigues al usuario'
    });
});

// PUT /api/usuarios/:userId/bloquear - Bloquear/desbloquear usuario
const bloquearUsuario = asyncHandler(async (req, res) => {
    const usuarioActual = req.usuario;
    const usuarioId = req.params.userId;

    if (usuarioActual._id.toString() === usuarioId) {
        res.status(400);
        throw new Error('No puedes bloquearte a ti mismo');
    }

    const usuarioABloquear = await usuario.findById(usuarioId);
    if (!usuarioABloquear) {
        res.status(404);
        throw new Error('Usuario no encontrado');
    }

    const estaBloqueado = usuarioActual.usuariosBloqueados && usuarioActual.usuariosBloqueados.includes(usuarioId);

    if (estaBloqueado) {
        // Desbloquear
        usuarioActual.usuariosBloqueados = usuarioActual.usuariosBloqueados.filter(id => id.toString() !== usuarioId);
        // También dejar de seguir si estaba siguiendo
        if (usuarioActual.siguiendo && usuarioActual.siguiendo.includes(usuarioId)) {
            usuarioActual.siguiendo = usuarioActual.siguiendo.filter(id => id.toString() !== usuarioId);
            usuarioABloquear.seguidores = usuarioABloquear.seguidores.filter(id => id.toString() !== usuarioActual._id.toString());
            await usuarioABloquear.save();
        }
    } else {
        // Bloquear
        if (!usuarioActual.usuariosBloqueados) {
            usuarioActual.usuariosBloqueados = [];
        }
        usuarioActual.usuariosBloqueados.push(usuarioId);
        // Dejar de seguir si estaba siguiendo
        if (usuarioActual.siguiendo && usuarioActual.siguiendo.includes(usuarioId)) {
            usuarioActual.siguiendo = usuarioActual.siguiendo.filter(id => id.toString() !== usuarioId);
            usuarioABloquear.seguidores = usuarioABloquear.seguidores.filter(id => id.toString() !== usuarioActual._id.toString());
            await usuarioABloquear.save();
        }
    }

    await usuarioActual.save();

    res.json({
        estaBloqueado: !estaBloqueado,
        mensaje: estaBloqueado ? 'Usuario desbloqueado' : 'Usuario bloqueado'
    });
});

// GET /api/usuarios/bloqueados - Listar usuarios bloqueados por el usuario actual
const obtenerUsuariosBloqueados = asyncHandler(async (req, res) => {
    const usuarioActual = await usuario.findById(req.usuario._id);

    if (!usuarioActual || !usuarioActual.usuariosBloqueados || usuarioActual.usuariosBloqueados.length === 0) {
        return res.json([]);
    }

    const bloqueados = await usuario.find({ _id: { $in: usuarioActual.usuariosBloqueados } })
        .select('nombre avatarUrl');

    res.json(bloqueados);
});

const generarTokenJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};


module.exports = { 
    registroUsuario, 
    loginUsuario, 
    obtenerUsuarioActual,
    obtenerContadores,
    obtenerUsuarioPorId,
    actualizarSubjectsFavoritos,
    actualizarLibrosFavoritos,
    actualizarLibrosLeyendo,
    actualizarLibrosLeidos,
    actualizarAvatar,
    actualizarNombre,
    seguirUsuario,
    bloquearUsuario,
    obtenerUsuariosBloqueados,
};

