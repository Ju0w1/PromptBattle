const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
global.__root   = __dirname + '/';


// Importar las rutas de los productos
const app = express();

// Conexion a mongo
const mongoose = require('mongoose');
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

let port = 3500;
app.listen(port, () => {
	console.log('Servidor arriba');
});