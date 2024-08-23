var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var TareaSchema = new Schema({
	_id: mongoose.Schema.Types.ObjectId,
	descripcion: {type: String, required: true, max: 200},
    tipo: {type: String, required: true, enum: ['Historia','Geografia','Arte','Videojuegos']},
});


// Exportar el modelo
module.exports = mongoose.model('Tarea', TareaSchema);