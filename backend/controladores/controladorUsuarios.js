const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const usuario = require('../modelos/modeloUsuarios');

const registroUsuario = asyncHandler(async (req, res) => {
    const { nombre, email, password } = req.body;

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
    });

    if(!user){
        res.status(400);
        throw new Error('Datos de usuario no válidos');
    }else{
        res.status(201).json({
            _id: user.id,
            nombre: user.nombre,
            email: user.email,
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
        token: generarTokenJWT(user._id),
    });
});


const obtenerUsuarioActual = asyncHandler(async (req, res) => {
  res.json(req.usuario);
});


const generarTokenJWT = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};


module.exports = { 
    registroUsuario, 
    loginUsuario, 
    obtenerUsuarioActual 
};

