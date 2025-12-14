const mongoose = require('mongoose');
const { type } = require('mquery/lib/env');

const esquemaUsuario = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es requerido']
        },
        email: {
            type: String,
            required: [true, 'Se reuiere el email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'La contraseña es requerida'],
        },
        subjectsFavoritos: {
            type: [String],
            default: [],
        },
        librosFavoritos: {
            type: [
                {
                    bookId: { type: String, required: true },
                    titulo: { type: String, required: true },
                    autores: { type: [String], default: [] },
                    portada: { type: String, default: '' },
                },
            ],
            default: [],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Usuario', esquemaUsuario);