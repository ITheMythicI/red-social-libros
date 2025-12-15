const mongoose = require('mongoose');

const notificacionSchema = mongoose.Schema({
    receptor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    emisor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true
    },
    tipo: {
        type: String,
        enum: ['like', 'comentario', 'seguidor', 'mencion'],
        required: true
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: false
    },
    leida: {
        type: Boolean,
        default: false
    },
    mensaje: {
        type: String,
        required: true
    }
}, { timestamps: true });

// Índice para consultas rápidas
notificacionSchema.index({ receptor: 1, leida: 1, createdAt: -1 });

module.exports = mongoose.model('Notificacion', notificacionSchema);

