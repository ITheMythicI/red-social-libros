const asyncHandler = require('express-async-handler');
const Notificacion = require('../modelos/ModeloNotificacion');

// GET /api/notificaciones - Obtener notificaciones del usuario
const obtenerNotificaciones = asyncHandler(async (req, res) => {
    const notificaciones = await Notificacion.find({ receptor: req.usuario._id })
        .populate('emisor', 'nombre avatarUrl')
        .sort({ createdAt: -1 })
        .limit(50);
    
    res.json(notificaciones);
});

// GET /api/notificaciones/no-leidas - Contar no leídas
const contarNoLeidas = asyncHandler(async (req, res) => {
    const count = await Notificacion.countDocuments({ 
        receptor: req.usuario._id, 
        leida: false 
    });
    
    res.json({ count });
});

// PUT /api/notificaciones/:id/leer - Marcar como leída
const marcarComoLeida = asyncHandler(async (req, res) => {
    const notificacion = await Notificacion.findById(req.params.id);
    
    if (!notificacion || notificacion.receptor.toString() !== req.usuario._id.toString()) {
        res.status(404);
        throw new Error('Notificación no encontrada');
    }
    
    notificacion.leida = true;
    await notificacion.save();
    
    res.json(notificacion);
});

// PUT /api/notificaciones/leer-todas - Marcar todas como leídas
const marcarTodasLeidas = asyncHandler(async (req, res) => {
    await Notificacion.updateMany(
        { receptor: req.usuario._id, leida: false },
        { leida: true }
    );
    
    res.json({ mensaje: 'Todas las notificaciones marcadas como leídas' });
});

// Helper: Crear notificación
const crearNotificacion = async (receptor, emisor, tipo, mensaje, post = null) => {
    // No notificar a ti mismo
    if (receptor.toString() === emisor.toString()) return;
    
    try {
        await Notificacion.create({
            receptor,
            emisor,
            tipo,
            mensaje,
            post
        });
    } catch (error) {
        console.error('Error al crear notificación:', error);
    }
};

module.exports = {
    obtenerNotificaciones,
    contarNoLeidas,
    marcarComoLeida,
    marcarTodasLeidas,
    crearNotificacion
};

