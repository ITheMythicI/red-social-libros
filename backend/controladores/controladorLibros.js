const asyncHandler = require('express-async-handler');

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

const normalizarLibro = (item) => {
    const info = item.volumeInfo || {};
    return {
        bookId: item.id,
        titulo: info.title || 'Sin título',
        autores: info.authors || [],
        portada:
            (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) ||
            '',
        descripcion: info.description || '',
        categorias: info.categories || [],
        publicado: info.publishedDate || '',
        idioma: info.language || '',
        previewLink: info.previewLink || '',
    };
};

// GET /api/libros?q=harry&startIndex=0&maxResults=10
const buscarLibros = asyncHandler(async (req, res) => {
    const { q = '', startIndex = 0, maxResults = 10 } = req.query;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    if (!q.trim()) {
        return res.status(400).json({ mensaje: 'El parámetro q es requerido' });
    }

    const url = new URL(GOOGLE_BOOKS_API);
    url.searchParams.set('q', q);
    url.searchParams.set('startIndex', startIndex);
    url.searchParams.set('maxResults', Math.min(Number(maxResults) || 10, 20));
    if (apiKey) url.searchParams.set('key', apiKey);

    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        return res.status(500).json({ mensaje: 'Error consultando Google Books' });
    }

    const data = await respuesta.json();
    const items = Array.isArray(data.items) ? data.items : [];
    const libros = items.map(normalizarLibro);

    res.json({
        total: data.totalItems || 0,
        resultados: libros,
    });
});

// GET /api/libros/:id
const detalleLibro = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    const url = new URL(`${GOOGLE_BOOKS_API}/${id}`);
    if (apiKey) url.searchParams.set('key', apiKey);

    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        return res.status(404).json({ mensaje: 'Libro no encontrado' });
    }

    const data = await respuesta.json();
    return res.json(normalizarLibro(data));
});

module.exports = {
    buscarLibros,
    detalleLibro,
};
