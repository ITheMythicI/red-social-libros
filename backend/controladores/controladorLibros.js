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

// GET /api/libros/sugerencias - Obtener sugerencias basadas en gustos del usuario
const obtenerSugerencias = asyncHandler(async (req, res) => {
    const Usuario = require('../modelos/modeloUsuarios');
    const usuario = await Usuario.findById(req.usuario._id);
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    // Obtener géneros favoritos y libros favoritos del usuario
    const subjects = usuario.subjectsFavoritos || [];
    const librosFavoritos = usuario.librosFavoritos || [];
    
    // Si no tiene preferencias, devolver libros populares
    if (subjects.length === 0 && librosFavoritos.length === 0) {
        const url = new URL(GOOGLE_BOOKS_API);
        url.searchParams.set('q', 'subject:bestseller');
        url.searchParams.set('maxResults', 5);
        if (apiKey) url.searchParams.set('key', apiKey);

        const respuesta = await fetch(url);
        if (!respuesta.ok) {
            return res.json({ sugerencias: [] });
        }

        const data = await respuesta.json();
        const items = Array.isArray(data.items) ? data.items : [];
        const sugerencias = items.map(normalizarLibro);
        return res.json({ sugerencias });
    }

    // Buscar libros basados en géneros favoritos
    const sugerencias = [];
    const generosABuscar = subjects.slice(0, 3); // Máximo 3 géneros

    for (const genero of generosABuscar) {
        const url = new URL(GOOGLE_BOOKS_API);
        url.searchParams.set('q', `subject:${genero}`);
        url.searchParams.set('maxResults', 3);
        if (apiKey) url.searchParams.set('key', apiKey);

        try {
            const respuesta = await fetch(url);
            if (respuesta.ok) {
                const data = await respuesta.json();
                const items = Array.isArray(data.items) ? data.items : [];
                const libros = items.map(normalizarLibro);
                sugerencias.push(...libros);
            }
        } catch (error) {
            console.error(`Error buscando libros para ${genero}:`, error);
        }
    }

    // Eliminar duplicados
    const uniqueSugerencias = Array.from(
        new Map(sugerencias.map(libro => [libro.bookId, libro])).values()
    ).slice(0, 5);

    res.json({ sugerencias: uniqueSugerencias });
});

// GET /api/libros/autor/:nombre - Obtener biografía de un autor
const obtenerBiografiaAutor = asyncHandler(async (req, res) => {
    const { nombre } = req.params;
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

    // Buscar libros del autor en Google Books
    const url = new URL(GOOGLE_BOOKS_API);
    url.searchParams.set('q', `inauthor:"${nombre}"`);
    url.searchParams.set('maxResults', 1);
    if (apiKey) url.searchParams.set('key', apiKey);

    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        return res.status(404).json({ mensaje: 'Autor no encontrado' });
    }

    const data = await respuesta.json();
    const items = Array.isArray(data.items) ? data.items : [];
    
    if (items.length === 0) {
        return res.status(404).json({ mensaje: 'Autor no encontrado' });
    }

    const libro = items[0];
    const info = libro.volumeInfo || {};
    
    // Crear biografía básica con información disponible
    const biografia = {
        nombre: nombre,
        libros: info.title || 'Libro desconocido',
        descripcion: info.description || `Autor conocido por sus obras en ${info.categories?.join(', ') || 'literatura'}.`,
        categorias: info.categories || [],
        portada: (info.imageLinks && (info.imageLinks.thumbnail || info.imageLinks.smallThumbnail)) || '',
    };

    res.json(biografia);
});

// GET /api/libros/datos-curiosos - Obtener datos curiosos
const obtenerDatosCuriosos = asyncHandler(async (req, res) => {
    // Base de datos de datos curiosos sobre libros y autores
    const datosCuriosos = [
        {
            tipo: 'libro',
            titulo: 'El libro más vendido del mundo',
            contenido: 'La Biblia es el libro más vendido de todos los tiempos, con más de 5 mil millones de copias vendidas.',
            imagen: '📖'
        },
        {
            tipo: 'autor',
            titulo: 'Escritor más prolífico',
            contenido: 'Ryoki Inoue, un autor brasileño, ha escrito más de 1,000 novelas bajo varios seudónimos.',
            imagen: '✍️'
        },
        {
            tipo: 'libro',
            titulo: 'El libro más robado',
            contenido: 'El libro más robado de bibliotecas es "El Alquimista" de Paulo Coelho.',
            imagen: '📚'
        },
        {
            tipo: 'autor',
            titulo: 'Escritora más joven',
            contenido: 'Dorothy Straight publicó "How the World Began" a los 4 años, siendo la autora publicada más joven.',
            imagen: '👶'
        },
        {
            tipo: 'libro',
            titulo: 'El libro más largo',
            contenido: '"A la recherche du temps perdu" de Marcel Proust tiene aproximadamente 1.2 millones de palabras.',
            imagen: '📖'
        },
        {
            tipo: 'autor',
            titulo: 'Rechazos famosos',
            contenido: 'J.K. Rowling fue rechazada por 12 editoriales antes de que "Harry Potter" fuera publicado.',
            imagen: '🦉'
        },
        {
            tipo: 'libro',
            titulo: 'El libro más caro',
            contenido: 'El "Codex Leicester" de Leonardo da Vinci fue vendido por Bill Gates por $30.8 millones en 1994.',
            imagen: '💰'
        },
        {
            tipo: 'autor',
            titulo: 'Escritor en prisión',
            contenido: 'Miguel de Cervantes escribió "Don Quijote" mientras estaba en prisión.',
            imagen: '🏰'
        }
    ];

    // Seleccionar 3 datos curiosos aleatorios
    const seleccionados = [];
    const indicesUsados = new Set();
    
    while (seleccionados.length < 3 && indicesUsados.size < datosCuriosos.length) {
        const indice = Math.floor(Math.random() * datosCuriosos.length);
        if (!indicesUsados.has(indice)) {
            indicesUsados.add(indice);
            seleccionados.push(datosCuriosos[indice]);
        }
    }

    res.json({ datosCuriosos: seleccionados });
});

module.exports = {
    buscarLibros,
    detalleLibro,
    obtenerSugerencias,
    obtenerBiografiaAutor,
    obtenerDatosCuriosos,
};
