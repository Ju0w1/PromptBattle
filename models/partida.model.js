var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var PartidaSchema = new Schema({
	_id: mongoose.Schema.Types.ObjectId,
	tema: {type: String, required: true, max: 200},
    jugadores: [{type: [String], required: true}],
    imagenes: [{type: [String], required: true}],
    tiempo: {type: Number, required: true},
    cantidadImagenes: {type: Number, required: true},
    ganador: {type: String, required: true},
});


// Exportar el modelo
module.exports = mongoose.model('Partida', PartidaSchema);