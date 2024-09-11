document.addEventListener('DOMContentLoaded', async function() {
    const name = sessionStorage.getItem('username');

    if(!name) window.location.href = '/';

    var socket = io();

    socket.emit('send-username', name);

    document.getElementById('welcome-message').textContent = `Bienvenido ${name}`;

    try {
        const response = await fetch('/temas/lista', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.status === 200 ) {
            // console.log(data)
            const gridContainer = document.getElementById('grid-container');
            gridContainer.innerHTML = '';
            data.forEach((tema, index) => {
                gridContainer.innerHTML += `
                <div class="card">
                    <div class="card-content">
                        <p>${tema.descripcion}</p>
                        <p><b>${tema.tipo}</b> </p> 
                        <p id="${index}">Battlers: <b>0/2</b></p>
                        <button data-key="${index}" id="play" class="play-button">Jugar</button>
                    </div>
                </div>
                `
            });

            const playButtons = document.querySelectorAll('.play-button');

            function handlePlayButtonClick() {
                const tema = this.closest('.card-content').querySelector('p').textContent;
                const idPartida = this.getAttribute('data-key');
                sessionStorage.setItem('temaPartida', tema);
                sessionStorage.setItem('idPartida', Number(idPartida));
                window.location.href = '/partida';
            }

            playButtons.forEach(button => {
                button.addEventListener('click', handlePlayButtonClick);
            });
            
        } else {
            console.log('Error al intentar acceder');
        }
    } catch (err) {
        console.log('Error en la solicitud: ' + err.message);
    }

    socket.emit('obtener-datos-partida');

    socket.on('actualizo-cantidad-players', (partida)=>{
        console.log('Partida recibida: ', partida)

        const players = document.getElementById(partida.idPartida).querySelector('b')
        players.textContent = `${partida.cantidad}/2`

        if(Number(partida.cantidad) === 2){
            const playButtons = document.querySelectorAll('.play-button');
            
            playButtons.forEach(button => {

                if(Number(button.getAttribute('data-key')) === partida.idPartida){
                    button.removeEventListener('click', handlePlayButtonClick)
                    button.classList.remove('play-button')
                    button.classList.add('disable-button')
                    button.getAttribute === true ? null : button.setAttribute('disabled', true)
                }

            });
        }
    })

    document.getElementById('logoutButton').addEventListener('click', async function() {
        socket.emit('desconectar', name)
        localStorage.removeItem('username');
        window.location.href = '/';
    });
});



