var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

router.post('/crear', async function(req, res) {
  try {
      const categoria = req.body.categoria;
      
      if(!categoria) res.status(500).send("Error al crear tema"+err)

      const bodyContent = {
        "messages": [
          {
            "role": "system",
            "content": "Teniendo en cuenta la siguiente descripción de prompt battle: Prompt Battle es un evento en vivo donde la gente compite contra otros usando text-to-image IA software sobre un tema en específico. Eres un generador de temas para un prompt battle. Debes generar 3 tópicos, en español, de no mas de 200 caracteres sobre la categoría que sea proporcionada. Por ejemplo: Crea un animal que sea una mezcla de otros animales."
          },
          {
            "role": "user",
            "content": `Categoria: ${categoria}`
          }
        ]
      }

      const bodyJSON = JSON.stringify(bodyContent)
      
      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`},
        body: bodyJSON     
      }
        
      fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@hf/thebloke/llama-2-13b-chat-awq`, options)
        .then(response => response.json())
        .then(response => {

          const texto = response.result.response

          // Remover texto innecesario al principio y al final
          const cleanResponse = texto.trim()
            .replace(/^.*?categoría de historia:\n/, '')
            .replace(/\nEs$/, '')
          
          const temasArray = cleanResponse.split(/\n\d+\.\s+/).filter(Boolean);
          
          res.status(200).send({ auth: true, temas: temasArray});
        })
        .catch(err => console.error(err));
      
  } catch (err) {
      res.status(500).send("Error al crear tema"+err)
  }
});

module.exports = router;

