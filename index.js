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

// Ruta para servir la partida del jugador
app.get('/partida', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'partida.html'));
});

let port = 3500;
server.listen(port, () => {
	console.log('Servidor arriba');
});

const users = []
const rooms = []

io.on('connection', (socket) => {
        
    socket.on('send-username', function(username) {

        let user = socket.handshake.session.user;
        
        if (!user) {
            const newUser = {
                username,
            };
            user = addUser(newUser);
            socket.handshake.session.user = user;
            socket.handshake.session.save();

            console.log("handshake: ",socket.handshake.session)
            console.log("este es el socketID: ",socket.id)
            console.log("usuarios: ",users)
            console.log(`${user.name} se conecto`);
        }
    });

    socket.on('disconnect', () => {
        try{
            const username = socket.handshake.session.user.name

            console.log(`${username} se desconecto`);
        }catch(err){
            console.log(err)
        }
    });

    socket.on('join-room', (datos) => {
        try {
            let roomData = {}
            let roomUsers = []

            const username = socket.handshake.session.user.name;

            socket.join(datos.room);

            roomUsers.push({username, id: socket.id});

            roomData = {
                room: datos.room,
                tema: datos.tema,
                users: roomUsers
            }

            rooms.push(roomData);

            // Enviar el mensaje a todos los usuarios del room
            io.to(datos.room).emit('user-joined-room', username);

        } catch (err) {
            console.log(err);
        }
    });

    socket.on('restoreSession', ({ storedSocketId }) => {
        try {
            console.log('rooms connected: ', socket.rooms)
            console.log("socket restored: ", storedSocketId)
            const socketId = storedSocketId;
            const roomInfo = rooms.find(room => room.users.some(user => user.id === socketId));

            console.log("restored room info:", roomInfo)
            if (roomInfo) {
                io.to(roomInfo.room).emit('room-info-players', roomInfo);
            } else {
                io.to(roomInfo.room).emit('room-info-players', { message: 'Room not found' });
            }
        } catch (err) {
            console.log(err);
        }
    });

    socket.on('room-info', (datos) => {
        try {
            const theRoom = datos.room;

            const roomInfo = rooms.find(room => room.room === theRoom);

            console.log(roomInfo)

            if (roomInfo) {
                io.to(roomInfo.room).emit('room-info-players', roomInfo);
            } else {
                io.to(roomInfo.room).emit('room-info-players', { message: 'Room not found' });
            }
        } catch (err) {
            console.log(err);
        }
    });
});

function addUser(newUser) {
    const user = {
        name: newUser.username,
    };
    users.push(user);
    return user;
}