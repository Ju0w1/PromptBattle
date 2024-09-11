var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
const url = require('url');
const fs = require('fs');

router.post('/generate', async function(req, res) {
    try{
      const texto = req.body.texto;

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

      const outputPath = `./public/images/image_${timestamp}.png`;

      const imagePath = `/images/image_${timestamp}.png`;

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

module.exports = router;