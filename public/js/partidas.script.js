document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');

    if(!token) window.location.href = '/login';

    const loader = document.getElementById('loader') 
    loader.style.display = 'block';

    var socket = io();

    socket.emit('admin-obtener-partidas')

    socket.on('admin-listado-partidas', (rooms) => {
        const resultContainer = document.getElementById('tabla')
        loader.style.display = 'none';
        resultContainer.style.display = 'block';

        if(rooms){
            rooms.forEach(element => {
                const newRow = document.createElement('tr')

                const newIdPartida = document.createElement('td')
                newIdPartida.textContent = element.id

                const newTema = document.createElement('td')
                newTema.textContent = element.tema

                const jugadoresListos = document.createElement('td')
                var cantidadReady = 0
                element.usuarios.forEach(usuario => {
                    if(usuario.isReady){
                        cantidadReady++
                        const p = document.createElement('p')
                        const readyPlayer = usuario.username
                        p.textContent = readyPlayer
                        jugadoresListos.appendChild(p)
                    }
                })
                
                const newTiempo = document.createElement('td')
                newTiempo.innerHTML = `
                    <select id="options" name="options">
                        <option value="1">1 minuto</option>
                        <option value="2">2 minutos</option>
                        <option value="3">3 minutos</option>
                    </select>
                `

                const newCantidadImages = document.createElement('td')
                newCantidadImages.innerHTML = `
                    <select id="options" name="options">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                `
                
                const newTipoGanador = document.createElement('td')
                newTipoGanador.innerHTML = `
                    <select id="options" name="options">
                        <option value="manual">Manual</option>
                        <option value="publico">Voto público</option>
                    </select>
                `

                const newButton = document.createElement('td')
                const button = document.createElement('button')
                button.classList.add('button-tabla')
                if(cantidadReady !== 2){
                    button.classList.remove('button-tabla')
                    button.classList.add('disable-button')
                    button.getAttribute === true ? null : button.setAttribute('disabled', true)
                }

                button.textContent = 'COMENZAR'

                newButton.appendChild(button)

                newRow.appendChild(newIdPartida)
                newRow.appendChild(newTema)
                newRow.appendChild(jugadoresListos)
                newRow.appendChild(newTiempo)
                newRow.appendChild(newCantidadImages)
                newRow.appendChild(newTipoGanador)
                newRow.appendChild(newButton)

                resultContainer.appendChild(newRow)
            });
        }else{
            console.log('Error, no se encontraron rooms')
        }
    })

    
    // try{
    //     const options = {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/x-www-form-urlencoded',
    //             'x-access-token':token
    //         }
    //     }

    //     const response = await fetch('/partidas/lista',options)

    //     const data = await response.json()

    //     if (response.status === 200 && data) {
            
    //         // manejo la data y genero la tabla
            
    //     } else {
    //         console.log('Error en las credenciales')
    //     }
    // }catch (err){
    //     console.log(err)
    // }
})

    