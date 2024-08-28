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
            "content": `Eres un asistente que cada vez que se consulta genera una nueva respuesta creativa`
          },
          {
            "role": "user",
            "content": `Teniendo en cuenta la siguiente descripción de prompt battle: Prompt Battle es un evento en vivo donde la gente compite contra otros usando text-to-image IA software sobre un tema en específico. 
            Tu respuesta deben ser 3 tópicos para que los jugadores deban crear los prompts que luego generaran imagenes. Los tópicos deberan ser en español, cada uno de no mas de 200 caracteres referentes a la categoria que sea brindada. El formato de tu respuesta debe ser Topico 1:, Topico 2: y Topico 3:.
            
            Categoria de los topicos: ${categoria}
            
            Formato de la respuesta con topicos de ejemplo:
            -- INICIO DE RESPUESTA --
            Topico 1: Crea un animal que sea una mezcla de otros animales.
            Topico 2: Crea una pintura que mezcle los estilos de Van Gogh y Picasso. 
            Topico 3: Crea un personaje con caracterisitcas de Mario y Luigi.
            -- FIN DE RESPUESTA --
            `
          }
        ]
      }

      // console.log(bodyContent)
      const bodyJSON = JSON.stringify(bodyContent)
      
      const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`},
        body: bodyJSON     
      }
        
      fetch(`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/meta/llama-3-8b-instruct-awq`, options)
        .then(response => response.json())
        .then(response => {

          const texto = response.result.response

          // console.log(texto)

          // Remover texto innecesario al principio y al final
          // const cleanText = texto.replace(/\n/g, '');
          const cleanResponse = texto.match(/Topico\s\d+:\s[\s\S]*?(?=(\n|Topico\s\d+:|$))/g)
                                  .map(match => match.replace(/Topico\s\d+:\s/, '').trim())
          
          cleanResponse.forEach(element => {
            console.log(element)
          });
          console.log(cleanResponse)
          
          res.status(200).send({ auth: true, temas: cleanResponse});
        })
        .catch(err => console.error(err));
      
  } catch (err) {
      res.status(500).send("Error al crear tema"+err)
  }
});

router.post('/guardar', async function(req, res) {
  
})

module.exports = router;

