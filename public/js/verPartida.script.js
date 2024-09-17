document.addEventListener('DOMContentLoaded', async function() {
    const name = sessionStorage.getItem('username');

    // if(!name) window.location.href = '/login';

    const partidaId = window.location.pathname.split("/").pop();

    var socket = io();

    socket.emit('admin-visualizar-partida', partidaId);

    socket.on('admin-info-partida-en-curso', (room)=>{
        if(Number(room.id) === Number(partidaId)){
            document.getElementById('title').textContent = `Partida ${room.id}: ${room.tema}`;

            console.log(room)
        }
    })
});