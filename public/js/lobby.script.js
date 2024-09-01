document.addEventListener('DOMContentLoaded', async function() {
    const name = localStorage.getItem('username');

    if(!name) window.location.href = '/';

    document.getElementById('welcome-message').textContent = `Bienvenido ${name}`;
    
    var socket = io();
    socket.emit('send-username', name);

    try {
        const response = await fetch('/temas/lista', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();

        if (response.status === 200 ) {
            console.log(data)
            const gridContainer = document.getElementById('grid-container');
            gridContainer.innerHTML = '';
            data.forEach(tema => {
                gridContainer.innerHTML += `
                <div class="card">
                    <div class="card-content">
                        <p>${tema.descripcion}</p>
                        <p><b>${tema.tipo}</b> </p> 
                        <button id="play" class="play-button">Jugar</button>
                    </div>
                </div>
                `
            });
            
            document.getElementById('play').addEventListener('click', async function() {
                const tema = this.closest('.card-content').querySelector('p').textContent
                
                socket.emit("join-room", {room: "room1", tema});

                window.location.href = `/partida`;
            });
        } else {
            console.log('Error en las credenciales');
        }
    } catch (err) {
        console.log('Error en la solicitud: ' + err.message);
    }
});

document.getElementById('logoutButton').addEventListener('click', async function() {
    localStorage.removeItem('username');
    window.location.href = '/';
});

