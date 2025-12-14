const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usuario = require('../modelos/modeloUsuarios');

const registroUsuario = asyncHandler(async (req, res) => {
    const { nombre, email, password, subjectsFavoritos = [], librosFavoritos = [] } = req.body;

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
        token: generarTokenJWT(user._id),
    });
});


const obtenerUsuarioActual = asyncHandler(async (req, res) => {
  res.json(req.usuario);
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
    });
});

// PUT /api/usuarios/favoritos
const actualizarLibrosFavoritos = asyncHandler(async (req, res) => {
    const { libros } = req.body;

    if (!Array.isArray(libros)) {
        res.status(400);
        throw new Error('El campo "libros" debe ser un arreglo de objetos');
    }

    const limpio = libros
        .map((libro) => ({
            bookId: (libro.bookId || '').toString(),
            titulo: (libro.titulo || '').toString(),
            autores: Array.isArray(libro.autores) ? libro.autores.map((a) => a.toString()) : [],
            portada: libro.portada ? libro.portada.toString() : '',
        }))
        .filter((libro) => libro.bookId && libro.titulo);

    req.usuario.librosFavoritos = limpio;
    await req.usuario.save();

    res.json({
        _id: req.usuario.id,
        nombre: req.usuario.nombre,
        email: req.usuario.email,
        subjectsFavoritos: req.usuario.subjectsFavoritos,
        librosFavoritos: req.usuario.librosFavoritos,
    });
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
    actualizarSubjectsFavoritos,
    actualizarLibrosFavoritos, 
};

