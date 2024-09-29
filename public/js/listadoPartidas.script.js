document.addEventListener('DOMContentLoaded', async function() {
    var socket = io();

    partidas = []

    const loader = document.getElementById('loader') 
    loader.style.display = 'block';

    const grid = document.getElementById('grid-container') 

    socket.emit('publico-partidas-para-votar')

    socket.on('fin-partida-comienza-votacion', (room)=>{
        
        if(room.finalizada){
            
            const index = partidas.findIndex(partida => partida.id === room.id);
            if(index === -1){
                partidas.push(room)
            }
            if(partidas.length > 0){
                const gridContainer = document.getElementById('grid-container');
                gridContainer.innerHTML = '';
                partidas.forEach((partida, index) => {
                    gridContainer.innerHTML += `
                    <div class="card" id="${partida.id}">
                        <div class="card-content">
                            <p class="card-tema">${partida.tema}</p> 
                            <p class="card-battlers">Battlers: <b>${partida.jugadoresListos[0]}</b> vs <b>${partida.jugadoresListos[1]}</b></p>
                            <p class="card-time" id="card-time-${partida.id}">Tiempo</p>
                            <button data-key="${partida.id}" id="play" class="play-button">Votar</button>
                        </div>
                    </div>
                    `
                });
    
                loader.style.display = 'none';
                grid.style.display = 'grid'
    
                const playButtons = document.querySelectorAll('.play-button');
    
                function handlePlayButtonClick() {
                    const idPartida = this.getAttribute('data-key');
                    window.location.href = '/votaciones/partida/' + idPartida;
                }
    
                playButtons.forEach(button => {
                    button.addEventListener('click', handlePlayButtonClick);
                });
            }
        }
    })

    socket.on('tiempo-votacion', (data)=>{
        console.log(data)
        cardTime = document.getElementById(`card-time-${data.idPartida}`)
        cardTime.textContent = `Tiempo: ${data.seconds}`

        if(data.seconds === 0){
            card = document.getElementById(`${data.idPartida}`)
            card.remove()
        }
    })
});



