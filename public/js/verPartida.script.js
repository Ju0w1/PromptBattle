document.addEventListener('DOMContentLoaded', async function() {
    const name = sessionStorage.getItem('username');

    // if(!name) window.location.href = '/login';

    const partidaId = window.location.pathname.split("/").pop();

    var socket = io();

    socket.emit('admin-visualizar-partida', partidaId);

    const leftWinnerBtn = document.getElementById('left-winner-btn')
    const rightWinnerBtn = document.getElementById('right-winner-btn')

    leftWinnerBtn.addEventListener('click', () => {
        socket.emit('admin-ganador', 0 , partidaId)
    })

    rightWinnerBtn.addEventListener('click', () => {
        socket.emit('admin-ganador', 1, partidaId)
    })

    socket.on('actualizo-texto', (data)=>{
        if(Number(data.idPartida) === Number(partidaId)){
            const targetElement = Array.from(document.querySelectorAll('.player-column')).find(el => el.textContent.includes(`${data.username}`));

            const nearbyElement = targetElement ? targetElement.querySelector('.prompt') : null;

            nearbyElement.textContent = ': '+data.texto;
        }
    })
    

    socket.on('admin-info-partida-en-curso', (room)=>{
        if(Number(room.id) === Number(partidaId)){
            document.getElementById('title').textContent = `Partida ${room.id}: ${room.tema}`;
            console.log(room)

            const player1 = document.getElementById('player-1');
            const player2 = document.getElementById('player-2');

            player1.textContent = `Jugador 1: ${room.usuarios[0].username}`;
            player2.textContent = `Jugador 2: ${room.usuarios[1].username}`;

            if(room.usuarios[0].imagenes?.length > 0){
                const player1container = document.querySelector('.images-container-player-1');
                player1container.innerHTML = '';

                room.usuarios[0].imagenes.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.src = image;
                    img.classList.add('generated-image');
                    img.id = `left-img-${index+1}`;
                    player1container.appendChild(img);
                })

                const player2container = document.querySelector('.images-container-player-2');
                player2container.innerHTML = '';

                room.usuarios[1].imagenes.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.src = image;
                    img.classList.add('generated-image');
                    img.id = `right-img-${index+1}`;
                    player2container.appendChild(img);
                })
            }
        }
    })
});