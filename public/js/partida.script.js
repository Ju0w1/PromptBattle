document.addEventListener('DOMContentLoaded', async function() {
    const name = sessionStorage.getItem('username');
    const temaPartida = sessionStorage.getItem('temaPartida');
    const idPartida = sessionStorage.getItem('idPartida');

    if (!name || !temaPartida) window.location.href = '/';

    var socket = io();

    socket.emit('ingresar-partida', {username: name, tema:temaPartida, idPartida});

    socket.on('error-ingreso-partida', ()=>{
        window.location.href = '/'
    })

    socket.on('partida-completa', ()=>{
        window.location.href = '/lobby'
    })

    socket.on('actualizo-cantidad-players', (datos)=>{
        if(Number(datos.idPartida) === idPartida){
            const players = document.getElementById('players-count')
            players.textContent = `Battlers en la sala: ${datos.cantidad}`;
        }
    })  

    socket.on('nuevo-integrante', (room)=>{
        const cantidadPlayers = document.getElementById("players-count")
        cantidadPlayers.textContent = `Battlers en la sala: ${room.usuarios.length}`
    })  

    socket.on('info-partida', (partida)=>{
        const tema = document.getElementById("tema")
        tema.textContent = partida.tema

        const cantidadPlayers = document.getElementById("players-count")
        cantidadPlayers.textContent = `Battlers en la sala: ${partida.usuarios.length}`
    })

    socket.emit('obtener-info-partida', idPartida)

    const readyButton = document.getElementById('ready-button')

    function handleReadyButtonClick() {
        socket.emit('player-ready', {username: name, idPartida});

        readyButton.removeEventListener('click', handleReadyButtonClick)
        readyButton.classList.remove('submit-button')
        readyButton.classList.add('disable-button')
        readyButton.getAttribute === true ? null : readyButton.setAttribute('disabled', true)
    }

    readyButton.addEventListener('click', handleReadyButtonClick)


    socket.on('comenzar-partida', async (room, partida) => {
        if(Number(room.id) === Number(idPartida)){

            const playersCount = document.getElementById('players-count')
            const readyButton = document.getElementById('ready-container')
            const submitButton = document.getElementById('submit')
            const inputContainer = document.getElementById('input-container')
            
            var tiempo = partida.tiempo * 60; // convert minutes to seconds

            const cantImagenes = Number(partida.canitdad_imagenes)
            const imagenes = []

            async function handleGenerateImage() {
                const textoObj = document.getElementById('texto')
                const texto = textoObj.value
        
                try{
                    const loader = document.getElementById('loader') 
                    loader.style.display = 'block';
                    const response = await fetch('/partidas/generate',{
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ texto }),
                    })
        
                    const data = await response.json()
        
                    if(response.status === 200 && data){
                        const imagen = document.getElementById('imagen')
                        imagen.src=data.image
                        imagenes.push(data.image)
                        socket.emit('imagen-generada', { imagen: data.image })
                    }else{
                        console.log('Error al generar imagen');
                    }
                }catch(error){
                    console.log(error)
                }finally{
                    const resultContainer = document.getElementById('result')
                    loader.style.display = 'none';
                    resultContainer.style.display = 'block';
                }
            }

            var countdown = setInterval(() => {
                const minutes = Math.floor(tiempo / 60);
                const seconds = tiempo % 60;
                playersCount.textContent = `Tiempo restante: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                tiempo--;
                if (tiempo < 0) {
                    clearInterval(countdown);
                    
                    inputContainer.style.display = 'none'
                    submitButton.style.display = 'none'

                    socket.emit('fin-partida', );
                }else{

                    if(cantImagenes === imagenes.length){
                        inputContainer.style.display = 'none'
                        submitButton.style.display = 'none'
                    }

                    submitButton.addEventListener('click', handleGenerateImage)
                }
            }, 1000); // update every 1 second
            
            readyButton.style.display = 'none'

            
            inputContainer.style.display = 'flex'
            submitButton.style.display = 'block'
        }
    })
});
