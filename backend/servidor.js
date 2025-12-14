const express = require('express');
const { errorHandler } = require('./middleware/errorMiddleware');
const dotenv = require('dotenv').config();
const dbConexion = require('./conexion/dbConexion');
const puerto = process.env.PUERTO || 5000;

dbConexion();
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));

// app.get('/api/tareas', (req, res) => {
//     res.status(200).json({ mensaje: 'Obtener todas las tareas' });
// });
app.use('/api/tareas', require('./rutas/rutasTareas'));
app.use('/api/usuarios', require('./rutas/rutasUsuarios'));

app.get('/', (req, res) => {
    res.redirect('/api/tareas');
});

app.use(errorHandler);

app.listen(puerto, "0.0.0.0")
    .on("listening", () => console.log("🔥 Escuchando correctamente"))
    .on("error", (err) => console.error("❌ Error al abrir puerto:", err));

console.log("SECRET ACTUAL:", process.env.JWT_SECRET);




