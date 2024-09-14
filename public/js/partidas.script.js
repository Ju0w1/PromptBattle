document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');

    if(!token) window.location.href = '/login';

    var socket = io();

    function handleComenzarButtonClick() {
        const id = this.getAttribute('data-key');
    
        const tr = document.getElementById(id);
    
        const tds = tr.querySelectorAll('td');
    
        const elem_idPartida = tds[0];
        
        const elem_tema = tds[1];
    
        const elem_jugadores_listos = tds[2];
    
        const players = [];
        if(elem_jugadores_listos.hasChildNodes()){
            const p = elem_jugadores_listos.querySelectorAll('p');
            
            for (let i = 0; i < p.length; i++) {
                players.push(p[i].textContent)
            }
        }
    
        const elem_tiempo = tds[3];
        const elem_canitdad_imagenes = tds[4];
        const elem_tipo_ganador = tds[5];
        
        const idPartida = elem_idPartida.textContent;
        const tema = elem_tema.textContent;
        const jugadoresListos = players;
        const tiempo = elem_tiempo.querySelector('select').value;
        const canitdad_imagenes = elem_canitdad_imagenes.querySelector('select').value;
        const tipo_ganador = elem_tipo_ganador.querySelector('select').value;
    
        socket.emit('admin-comenzar-partida', { 
            idPartida, tema, jugadoresListos, tiempo, canitdad_imagenes, tipo_ganador 
        });
    }


    socket.emit('admin-obtener-partidas')

    socket.on('admin-listado-partidas', (rooms) => {
        console.log('Se activa el listado de admin')
        const loader = document.getElementById('loader') 
        loader.style.display = 'block';

        const resultContainer = document.getElementById('tabla')

        const trs = resultContainer.querySelectorAll('tr')

        for (let i = trs.length-1; i > 0; i--) {
            trs[i].remove()
        }

        if(rooms){
            rooms.forEach(element => {
                const newRow = document.createElement('tr')
                newRow.id = element.id

                const newIdPartida = document.createElement('td')
                newIdPartida.textContent = element.id
                newIdPartida.id = 'idPartida'

                const newTema = document.createElement('td')
                newTema.textContent = element.tema
                newTema.id = 'tema'

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
                jugadoresListos.id = 'jugadores-listos'
                
                const newTiempo = document.createElement('td')
                newTiempo.innerHTML = `
                    <select id="options" name="options">
                        <option value="1">1 minuto</option>
                        <option value="2">2 minutos</option>
                        <option value="3">3 minutos</option>
                    </select>
                `
                newTiempo.id = 'tiempo'

                const newCantidadImages = document.createElement('td')
                newCantidadImages.innerHTML = `
                    <select id="options" name="options">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                    </select>
                `
                newCantidadImages.id = 'cantidad-imagenes'
                
                const newTipoGanador = document.createElement('td')
                newTipoGanador.innerHTML = `
                    <select id="options" name="options">
                        <option value="manual">Manual</option>
                        <option value="publico">Voto público</option>
                    </select>
                `
                newTipoGanador.id = 'tipo-ganador'

                const newButton = document.createElement('td')
                const button = document.createElement('button')
                button.classList.add('button-tabla')
                // set key attribbute with the value of the id
                button.setAttribute('data-key', element.id)
                if(cantidadReady !== 2){
                    button.classList.remove('button-tabla')
                    button.classList.add('disable-button')
                    button.getAttribute === true ? null : button.setAttribute('disabled', true)
                }else{
                    button.addEventListener('click', handleComenzarButtonClick);
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


                loader.style.display = 'none';
                resultContainer.style.display = 'block';
                
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

    