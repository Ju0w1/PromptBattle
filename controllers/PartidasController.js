var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const url = require('url');

router.post('/acceso', async function(req, res) {
    try{
      const tema = req.body.tema;
      
      res.redirect(url.format({
        pathname: '/partida',
        query: {
          tema: tema
        }
      }))
    }catch (err) {
      res.status(500).send("Error al guardar tema"+err)
      console.log(err)
  }
})

module.exports = router;