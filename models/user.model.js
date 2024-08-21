var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
	_id: mongoose.Schema.Types.ObjectId,
	nombre: {type: String, required: true, max: 200},
    email: {type: String, required: true, unique: true,
        match: /.+\@.+\..+/
    },
    contrasenia: {type: String, required: true}
});


// Exportar el modelo
module.exports = mongoose.model('User', UserSchema);