const mongoose = require('mongoose');

const comentarioSchema = mongoose.Schema({
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    },
    texto: {
        type: String,
        required: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
}, { timestamps: true });

const postSchema = mongoose.Schema({
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
    },
    texto: {
        type: String,
        required: true,
    },
    libro: {
        bookId: String,
        titulo: String,
        autores: [String],
        portada: String,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }],
    comentarios: [comentarioSchema],
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
