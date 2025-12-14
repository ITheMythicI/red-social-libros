const http = require('http');
const {Server} = require('socket.io');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Servidor Socket.io funcionando\n');
});

const io = new Server(server);

const user = ({id, nombreusuario, sala}) => {
    return {usuario: {id, nombreusuario, sala}};
};

const generateMsg = (usuario, texto) => {
    return {usuario, texto, creado: new Date().getTime()};
};

// const socketio = require('socket.io');
io.on('conexion', socket => {
    console.log('Nueva cliente conectado: ', socket.io);
    socket.on('join', ({nombreusuario, sala}, callback) => {
        const {error, user} = addUser({id: socket.id, nombreusuario, sala});
        if(error) return callback(error);
        socket.join(user.sala);
        socket.emit('message', generateMessage('Admin', 'Bienvenido a Chat TecApp '));
        callback();
    }); 
});

const puerto = 3000;
server.listen(puerto, () => console.log(`Servidor corriendo en el puerto ${puerto}`));