const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Usuario = require('../modelos/modeloUsuarios');

const proteger = asyncHandler(async (req, res, next) => {
    let token;

    // 1. Verificar que venga Authorization con Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificar token
            const decodificado = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Buscar usuario
            req.usuario = await Usuario.findById(decodificado.id).select('-password');

            return next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ mensaje: 'Token inválido o expirado' });
        }
    }

    // 4. Si no hay token
    return res.status(401).json({ mensaje: 'No autorizado, token no encontrado' });
});

module.exports = { proteger };
