const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
global.__root   = __dirname + '/';
const http = require('http');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const session = require('express-session');
const sharedsession = require("express-socket.io-session");
const FileStore = require('session-file-store')(session);
// Importar las rutas de los productos
const app = express();

// crear server socket io
const server = http.createServer(app);
const io = socketIO(server);

const fileStoreOptions = {};

const sessionMiddleware = session({
    store: new FileStore(fileStoreOptions),
    secret: process.env.FILE_STORE_SECRET,
    resave: false,
    saveUninitialized: false
});

app.use(sessionMiddleware);
io.use(sharedsession(sessionMiddleware));

// Conexion a mongo
const mongoDB = `${process.env.SERVER}${process.env.USUARIO_BD}:${process.env.CONTRASENIA_BD}@${process.env.SERVER_LOCATION}${process.env.APP_NAME}`

mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: false}));


app.get('/api', function (req, res) {
	res.status(200).send('API works.');
});

var AuthController = require('./auth/AuthController');
const verifyToken = require('./auth/VerifyToken');
app.use('/api/auth', AuthController);

////////////////////////////// 

var TemasController = require('./controllers/TemasController');
var PartidasController = require('./controllers/PartidasController');
app.use('/temas', TemasController);
app.use('/partidas', PartidasController);


// Middleware para parsear datos de formularios
app.use(express.urlencoded({ extended: true }));

// Configuración para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'inicio.html'));
});

// Ruta para servir el lobby
app.get('/lobby', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'lobby.html'));
});

// Ruta para servir el formulario de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Ruta para servir el dashboard de admin
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Ruta para servir la carga de temas para admin
app.get('/dashboard/cargartemas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'crearTemas.html'));
});

// Ruta para servir la lista de partidas
app.get('/dashboard/partidas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'partidas.html'));
});

app.get('/dashboard/partidas/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'verPartida.html'));
});

// Ruta para servir la partida del jugador
app.get('/partida', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'partida.html'));
});

let port = 3500;
server.listen(port, () => {
	console.log('Servidor arriba');
});

const users = new Map()
const rooms = []

io.on('connection', (socket) => {

    console.log('Socket conectado: ', socket.id);

    socket.on('send-username', (username) => {
        if (users.has(username)) {
            console.log(`El usuario ${username} ya está conectado`);
            users.get(username).socketId = socket.id

            const referer = socket.handshake.headers.referer;
            
            if (referer && referer.includes('/lobby')) {
                console.log('Usuario conectado desde el lobby, limpiando salas...');

                rooms.forEach((room) => {
                    const userIndex = room.usuarios.findIndex(user => user.username === username);

                    if (userIndex !== -1) {
                        console.log(`Eliminando al usuario ${username} de la room ${room.id}`);
                        room.usuarios.splice(userIndex, 1); // Eliminar el usuario de la room
                        io.to('adminRooms').emit('admin-listado-partidas', rooms)
                        io.to(`room${room.id}`).emit("info-partida", room);
                    }
                });
            }

            return;
        }else{
            const newUser = {
                username,
                socketId: socket.id
            };
            addUser(newUser);

            console.log(`${newUser.username} se conectó con socket ID: ${newUser.socketId}`);

        }
    });

    socket.on('obtener-datos-partida', () => {
        // console.log('Rooms de send-username: ',rooms.length)
        if(rooms.length>0){
            rooms.forEach(element => {
                // console.log(element)
                io.sockets.emit('actualizo-cantidad-players', { idPartida: element.id, cantidad: element.usuarios.length });
            });
        }
    })

    // Manejar el ingreso a una partida
    socket.on('ingresar-partida', (data) => {

        console.log(`${new Date()} - Se solicita ingreso a partida con esta data: `, data)

        const username = data.username;
        if (username && users.has(username)) {
            // console.log(`El usuario ${username} ingresó a la partida ${data.idPartida}`);

            const index = rooms.findIndex(element => Number(element.id) === Number(data.idPartida));

            const object = rooms[index]

            if(object) {
                const indice = object.usuarios.findIndex(usuario => usuario.username === username)
                if(object.usuarios[indice]){
                    socket.emit('usuario-ya-esta-en-partida', { message: 'El usuario ya se encuentra en la partida' });
                }else
                if(object.usuarios.length >= 2){
                    socket.emit('partida-completa', { message: 'Esta partida alcanzo el maximo de jugadores.' });
                        
                    console.log(`${new Date()} - La cantidad de usuarios superan el maximo por lo que se emite partida-completa`)
                }
                else{
                    const user = users.get(username)
                    const newUser = {
                        username: user.username,
                        socketId: user.socketId,
                        isReady: false
                    }
                    object.usuarios.push(newUser) 
                    rooms[index] = object

                    socket.join(`room${object.id}`)

                    io.to(`room${object.id}`).emit("nuevo-integrante", object);
                    io.to('adminRooms').emit('admin-listado-partidas', rooms)
                    console.log(`${new Date()} - No esta completa la lista, se agrega el usuario a la lista del room`)
                }
            }else{
                console.log(`${new Date()} - No existe room, se procede a crearlo`)
                const usuarios = []
                const user = users.get(username)
                const newUser = {
                    username: user.username,
                    socketId: user.socketId,
                    isReady: false
                }
                usuarios.push(newUser)
                const room = {
                    tema: data.tema,
                    usuarios,
                    id: Number(data.idPartida)
                }
                rooms.push(room)

                socket.join(`room${room.id}`)

                io.to(`room${room.id}`).emit("nuevo-integrante", room);
                io.to('adminRooms').emit('admin-listado-partidas', rooms)
                console.log(`${new Date()} - Room creado`)
            }    

            rooms.forEach(element => {
                if(Number(element.id) === Number(data.idPartida)){
                    // socket.emit('info-partida',  element );
                    io.to(`room${element.id}`).emit('info-partida',  element);
                }

                console.log(`Room ${element.id}`, element)

                io.sockets.emit('actualizo-cantidad-players', { idPartida: element.id, cantidad: element.usuarios.length });
            })

        } else {
            console.log(`El usuario ${username} no está registrado.`);
            socket.emit('error-ingreso-partida', { message: 'Usuario no registrado.' });
        }
    });

    socket.on('player-ready', (data) => {
        rooms.forEach(room => {
            if(Number(room.id) === Number(data.idPartida)){
                room.usuarios.forEach(usuario => {
                    if(usuario.username === data.username){
                        usuario.isReady = true
                    }
                })
            }
        })
        io.to('adminRooms').emit('admin-listado-partidas', rooms)
    })

    socket.on('admin-obtener-partidas', () => {
        socket.join('adminRooms')
        io.to('adminRooms').emit('admin-listado-partidas', rooms)
    })

    socket.on('obtener-info-partida', (idPartida) =>{
        rooms.forEach(room => {
            if(Number(room.id) === Number(idPartida)){
                socket.emit('info-partida', room);
            }
        })
    })

    socket.on('admin-comenzar-partida', (partida) =>{
        rooms.forEach(room => {
            if(Number(room.id) === Number(partida.idPartida)){
                room.jugadoresListos = partida.jugadoresListos
                room.tiempo = partida.tiempo
                room.cantidadImagenes = partida.canitdad_imagenes
                room.tipoGanador = partida.tipo_ganador
                
                io.to(`room${room.id}`).emit('comenzar-partida', room, partida);

            }
        })
    })

    socket.on('admin-visualizar-partida', (idPartida) =>{
        console.log("recibbido: ", idPartida)
        rooms.forEach(room => {
            if(Number(room.id) === Number(idPartida)){
                socket.join('adminRooms')
                io.to(`room${room.id}`).emit('admin-info-partida-en-curso', room)
            }
        })
    })

    socket.on('imagen-generada', (datos) =>{
        rooms.forEach(room => {
            if(Number(room.id) === Number(datos.idPartida)){
                room.usuarios.forEach(usuario => {
                    if(usuario.username === datos.username){
                        const images = usuario.imagenes ? usuario.imagenes : [] 
                        images.push(datos.imagen)
                        usuario.imagenes = images

                        io.to(`room${room.id}`).emit('admin-info-partida-en-curso', room)
                    }
                })
            }
        })
    })

    socket.on('disconnect', () => {
        for (const [clave, objeto] of users){
            if(objeto['socketId'] === socket.id){
                console.log('Se desconecto: ', objeto['username'])
            }
        }

    })

    socket.on('desconectar', (username) =>{
        users.delete(username)
        socket.disconnect()
    })

});

// Función para agregar un usuario al mapa de usuarios
function addUser(newUser) {
    const user = {
        username: newUser.username,
        socketId: newUser.socketId,
        isReady: false,
    };
    users.set(user.username, user); // Usar el username como clave
    return user;
}

module.exports = rooms;
