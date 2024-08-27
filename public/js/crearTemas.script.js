document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');

    if(!token) window.location.href = '/login';
})

document.getElementById('selectionForm').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita el envío del formulario

    // const token = localStorage.getItem('token');

    // if(!token) window.location.href = '/login';

    // Obtener la opción seleccionada
    const selectedOption = document.getElementById('options').value;

    const bodyData = new URLSearchParams({ categoria: selectedOption });

    // console.log(selectedOption)
    // console.log(bodyData)

    const options = {
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        body: bodyData.toString()
      };

      
    fetch('/temas/crear', options)
      .then(response => response.json())
      .then(response => {
        const arrayTemas = response.temas
        const resultContainer = document.getElementById('result');

        resultContainer.innerHTML = `<h3>Estos son los temas creados</h3>`;
        arrayTemas.forEach(element => {
          resultContainer.innerHTML += `<p>${element}</p>`;
        });
        
      })
      .catch(err => console.error(err));
});
