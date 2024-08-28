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
app.use('/temas', verifyToken, TemasController);


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

// Ruta para servir el dashboard de admin
app.get('/dashboard/cargartemas', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'crearTemas.html'));
});

let port = 3500;
server.listen(port, () => {
	console.log('Servidor arriba');
});

const users = []

io.on('connection', (socket) => {

    socket.on('send-username', function(username) {
        let user = socket.handshake.session.user;

        if (!user) {
            user = addUser(username);
            socket.handshake.session.user = user;
            socket.handshake.session.save();

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

    // console.log('Se conecto un usuario: ', socket.handshake.query.username);

    // if (!user) {
    //     user = addUser();
    //     socket.handshake.session.user = user;
    //     socket.handshake.session.save();
    // }

    // socket.userName = user.name;
    // socket.emit("welcome", user);

    // socket.on('disconnect', () => {
    //     removeUser(user);
    // });

    // socket.on("click", () => {
    //     handleUserClick(user);
    // });

    // socket.on("restart", resetGame);
});

function addUser(username) {
    const user = {
        name: username,
    };
    users.push(user);
    // updateUsers();
    return user;
}

// function updateUsers() {
//     const clicks = users.reduce((sum, u) => sum + u.clicks, 0);
//     const progress = `${(clicks / 30) * 100}%`;
//     const ganador = users.find(u => u.ganador)?.name || '';

//     const userList = users.map(u => `${u.name} <small>(${u.clicks} clicks)</small>`).join(', ');

//     io.emit("users", {
//         users: userList,
//         clicks,
//         progress,
//         ganador: ganador ? `${ganador} ganó` : ''
//     });
// }