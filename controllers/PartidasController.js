var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.get('/lista', async function(req, res) {
    try{
      const temas = await Tema.find({},{ _id: 0 })
      
      res.status(200).send(temas);
    }catch (err) {
      res.status(500).send("Error al guardar tema"+err)
      console.log(err)
  }
  })