var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
var VerifyToken = require('./VerifyToken');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
var User = require('../models/user.model');

var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var config = require('../config/config');

router.post('/register', async function(req, res) {
    try {
        var hashedPassword = bcrypt.hashSync(req.body.contrasenia, 8);
        const newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            nombre : req.body.nombre,
            email : req.body.email,
            contrasenia : hashedPassword
        });

        await newUser.save();

        var token = jwt.sign(
            { id: newUser._id }, 
            config.secret, 
            {expiresIn: 86400} // expira en 24 hours
        );
        res.status(200).send({ auth: true, token: token });
    } catch (err) {
        res.status(500).send("Error al crear usuario"+err)
    }
});


router.get('/user', VerifyToken, async function(req, res, next) {
    try{
        const user = await User.findById(req.userId,{ contrasenia: 0 })
        
        if (!user) return res.status(404).send("No existe el usuario.");

        res.status(200).send(user);

    }catch (err){
        return res.status(500).send("Error al encontrar usuario.");
    }
});

router.post('/login', async function(req, res) {
    try{
        const user = await User.findOne({ email: req.body.email })

        if (!user) return res.status(404).send('Error en credenciales');

        var passwordIsValid = bcrypt.compareSync(req.body.contrasenia,user.contrasenia);
		if (!passwordIsValid) return res.status(401).send({ auth: false,token: null });
		var token = jwt.sign({ id: user._id }, config.secret, {
			expiresIn: 86400 // expira en 24 hours
		});
		res.status(200).send({ auth: true, token: token });
    }catch(err){
        return res.status(500).send('Error.' + err);
    }
});

module.exports = router;