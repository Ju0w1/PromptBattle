document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');

    if(!token) window.location.href = '/login';
})

document.getElementById('selectionForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita el envío del formulario

    const selectedOption = document.getElementById('options').value;

    const bodyData = new URLSearchParams({ categoria: selectedOption });

    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: bodyData.toString()
      };

      
    fetch('/temas/crear', options)
      .then(response => response.json())
      .then(response => {
        const resultContainer = document.getElementById('result')

        const titulo = document.createElement("h3")
          titulo.innerText = "Estos son los temas creados"

        resultContainer.appendChild(titulo)

        const arrayTemas = response.temas

        arrayTemas.forEach(element => {

          const newDiv = document.createElement("div")
          newDiv.classList.add("tema-box")

          const content = document.createElement("p")
          content.textContent = element

          const buttonContainer = document.createElement("div")
          buttonContainer.classList.add("buttons-container")

          const checkButton = document.createElement("button")
          checkButton.innerHTML = "✅"
          checkButton.style.marginRight = "5px"
          checkButton.id = 'save'

          const cancelButton = document.createElement("button")
          cancelButton.innerHTML = "❌"
          cancelButton.id = 'remove'

          buttonContainer.appendChild(checkButton)
          buttonContainer.appendChild(cancelButton)

          newDiv.appendChild(content)
          newDiv.appendChild(buttonContainer)

          resultContainer.appendChild(newDiv)


          checkButton.addEventListener('click', function() {
            const pValue = this.closest('.tema-box').querySelector('p').textContent
            console.log(pValue)
          })

          cancelButton.addEventListener('click', function() {
            const div = this.closest('.tema-box')
            div.remove()
          })
        });
        
      })
      .catch(err => console.error(err));
});


