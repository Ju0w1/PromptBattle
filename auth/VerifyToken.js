var jwt = require('jsonwebtoken');
var config = require('../config/config');

function verifyToken(req, res, next) {
	console.log(req.headers['x-access-token'])

	var token = req.headers['x-access-token']; // No se como obtenerlo
	
	if (!token) return res.status(403).send({ auth: false, message: 'No se brindo un token' }); //.send({ auth: false, message: 'Sin token.'})
	
	jwt.verify(token, config.secret, function(err, decoded) {
		if (err) return res.status(500).send({ auth: false, message: 'Error al autenticar token' });
		req.userId = decoded.id;
		next();
	});
}

module.exports = verifyToken;