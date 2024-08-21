const express = require('express');
const bodyParser = require('body-parser');

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
app.use('/api/auth', AuthController);

let port = 3500;
app.listen(port, () => {
	console.log('Servidor arriba');
});