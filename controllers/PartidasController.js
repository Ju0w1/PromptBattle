var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const url = require('url');
const fs = require('fs');
var Partida = require('../models/partida.model');

router.post('/generate', async function(req, res) {
    try{
      const texto = req.body.texto;
      const name = req.body.name;
      const idPartida = req.body.idPartida;

      if(!texto) res.status(500).send("Error al crear tema"+err)

      const bodyContent = {
        "prompt": texto
      }

      const options = {
        method: 'POST',
        headers: {Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`},
        body: JSON.stringify(bodyContent)     
      }

      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/stabilityai/stable-diffusion-xl-base-1.0`, options)
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      
      const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);

      const outputPath = `./public/images/image_${idPartida}_${name}_${timestamp}.png`;

      const imagePath = `/images/image_${idPartida}_${name}_${timestamp}.png`;

      fs.writeFile(outputPath, buffer, (error) => {
        if(error){
          console.log(error)
        }
      })

      res.status(200).send({image: imagePath})

    }catch (err) {
      res.status(500).send("Error al guardar tema"+err)
      console.log(err)
  }
})

router.post('/guardar', async function(req, res) {
  try{
    const room = req.body.room;
    const tema = room.tema;
    const jugadores = [
      `${room.usuarios[0].username}, votos: ${room.usuarios[0].votos ? room.usuarios[0].votos.toString() : ''}, imagenes: ${room.usuarios[0].imagenes ? room.usuarios[0].imagenes.join(";") : ''}`,
      `${room.usuarios[1].username}, votos: ${room.usuarios[1].votos ? room.usuarios[1].votos.toString() : ''}, imagenes: ${room.usuarios[1].imagenes ? room.usuarios[1].imagenes.join(";") : ''}`
    ]
    const tiempo = Number(room.tiempo)
    const cantidadImagenes = Number(room.cantidadImagenes)
    const ganador = room.ganador
    const tipoEleccionGanador = room.tipoGanador

    const newPartida = new Partida({
      _id: new mongoose.Types.ObjectId(),
      tema: tema,
      jugadores,
      tiempo: tiempo,
      cantidadImagenes: cantidadImagenes,
      tipoEleccionGanador,
      ganador: ganador,
    })
    
    await newPartida.save()
    res.status(200).send({message:'Partida guardada'})
    
  }catch (err) {
    res.status(500).send("Error al guardar tema"+err)
    console.log(err)
  }
})

module.exports = router;

