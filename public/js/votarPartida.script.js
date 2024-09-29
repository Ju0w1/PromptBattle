document.addEventListener('DOMContentLoaded', async function() {

    const partidaId = window.location.pathname.split("/").pop();

    var socket = io();

    socket.emit('obtener-datos-partida-votacion', partidaId);

    totalVotes = 0;

    const leftWinnerBtn = document.getElementById('left-winner-btn')
    const rightWinnerBtn = document.getElementById('right-winner-btn')

    if(sessionStorage.getItem('hasVoted')){
        leftWinnerBtn.parentNode.removeChild(leftWinnerBtn);
        rightWinnerBtn.parentNode.removeChild(rightWinnerBtn);
    }

    leftWinnerBtn.addEventListener('click', () => {
        sessionStorage.setItem('hasVoted', true);

        socket.emit('voto-partida', {jugador: 0 , idPartida: partidaId})
        leftWinnerBtn.parentNode.removeChild(leftWinnerBtn);
        rightWinnerBtn.parentNode.removeChild(rightWinnerBtn);
    })

    rightWinnerBtn.addEventListener('click', () => {
        sessionStorage.setItem('hasVoted', true);

        socket.emit('voto-partida', {jugador: 1, idPartida: partidaId})
        leftWinnerBtn.parentNode.removeChild(leftWinnerBtn);
        rightWinnerBtn.parentNode.removeChild(rightWinnerBtn);
    })

    socket.on('actualizar-votos', (data) => {
        if(Number(data.idPartida) === Number(partidaId)){
            const votosPlayer1 = data.jugadores[0].votos || 0;
            const votosPlayer2 = data.jugadores[1].votos || 0;
            totalVotes = votosPlayer1 + votosPlayer2;

            const porcentajePlayer1 = (votosPlayer1 / totalVotes) * 100 || 0;
            document.getElementById('player-1-votes').innerHTML = `Votos: ${votosPlayer1} (<b>${porcentajePlayer1.toFixed(2)}%</b>)`;

            const porcentajePlayer2 = (votosPlayer2 / totalVotes) * 100 || 0;
            document.getElementById('player-2-votes').innerHTML = `Votos: ${votosPlayer2} (<b>${porcentajePlayer2.toFixed(2)}%</b>)`;
        }
    })
    

    socket.on('datos-partida-votacion', (room) => {
        if(Number(room.id) === Number(partidaId)){
            document.getElementById('title').textContent = `Partida ${room.id}: ${room.tema}`;

            const player1 = document.getElementById('player-1');
            const player2 = document.getElementById('player-2');

            player1.textContent = `Jugador 1: ${room.usuarios[0].username}`;
            player2.textContent = `Jugador 2: ${room.usuarios[1].username}`;

            totalVotes = 0;

            const votosPlayer1 = room.usuarios[0].votos || 0;
            const votosPlayer2 = room.usuarios[1].votos || 0;
            totalVotes = votosPlayer1 + votosPlayer2;

            const porcentajePlayer1 = (votosPlayer1 / totalVotes) * 100 || 0;
            document.getElementById('player-1-votes').innerHTML = `Votos: ${votosPlayer1} (<b>${porcentajePlayer1.toFixed(2)}%</b>)`;
            
            const porcentajePlayer2 = (votosPlayer2 / totalVotes) * 100 || 0;
            document.getElementById('player-2-votes').innerHTML = `Votos: ${votosPlayer2} (<b>${porcentajePlayer2.toFixed(2)}%</b>)`;

            if(room.ganador){
                console.log('Ganador: ', room.ganador)
                sessionStorage.removeItem('hasVoted');
                // mostrar modal con el ganador

                const modal = document.getElementById('modal');
                const messageElement = document.getElementById('modal-message');
                const imageElement = document.getElementById('modal-images');
                const closeButton = document.getElementById('close-btn');

                messageElement.textContent = `¡El ganador es ${room.ganador} 🎉🎉!`;

                const jugadorGanador = room.usuarios.find(j => j.username === room.ganador);

                imageElement.innerHTML = '';

                jugadorGanador.imagenes.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.src = image;
                    img.classList.add('generated-image');
                    img.id = `winner-img-${index+1}`;
                    imageElement.appendChild(img);
                });

                modal.classList.add('show');

                // Cerrar el modal al hacer clic en el botón
                closeButton.addEventListener('click', () => {
                    modal.classList.remove('show');
                    socket.emit('terminar-partida', partidaId);
                    window.location.href = '/votaciones/listado';
                });
            }else if(room.usuarios[0].imagenes?.length > 0){
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
    });

    socket.on('tiempo-votacion', (data) => {
        if(Number(data.idPartida) === Number(partidaId)){
            cardTime = document.getElementById(`time`)
            cardTime.textContent = `Tiempo: ${data.seconds}`
        }
    });

    socket.on('fin-votacion', (room) => {
        // console.log('llega fin-votacion a cliente',room);
        // console.log(room.idPartida)
        // console.log(partidaId)
        // console.log(Number(room.idPartida))
        // console.log(Number(partidaId))
        if(Number(room.id) === Number(partidaId) && room.votacionFinalizada === undefined){
            console.log('fin de la votacion');

            if(document.getElementById('left-winner-btn')) leftWinnerBtn.parentNode.removeChild(leftWinnerBtn)
            if(document.getElementById('right-winner-btn')) rightWinnerBtn.parentNode.removeChild(rightWinnerBtn)
            // rightWinnerBtn.parentNode.removeChild(rightWinnerBtn);

            sessionStorage.removeItem('hasVoted');
            
            if(room.ganador){
                console.log('Ganador: ', room.ganador)

                const modal = document.getElementById('modal');
                const messageElement = document.getElementById('modal-message');
                const imageElement = document.getElementById('modal-images');
                const closeButton = document.getElementById('close-btn');

                messageElement.textContent = `¡El ganador es ${room.ganador} 🎉🎉!`;

                const jugadorGanador = room.usuarios.find(j => j.username === room.ganador);

                jugadorGanador.imagenes.forEach((image, index) => {
                    const img = document.createElement('img');
                    img.src = image;
                    img.classList.add('generated-image');
                    img.id = `winner-img-${index+1}`;
                    imageElement.appendChild(img);
                });

                modal.classList.add('show');

                // Cerrar el modal al hacer clic en el botón
                closeButton.addEventListener('click', () => {
                    modal.classList.remove('show');
                    // socket.emit('terminar-partida', partidaId);
                    window.location.href = '/votaciones/listado';
                });
            
            }
        }
    });

});