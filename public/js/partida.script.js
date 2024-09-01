document.addEventListener('DOMContentLoaded', async function() {
    const name = localStorage.getItem('username');

    if (!name) window.location.href = '/';

    var socket = io();

    socket.emit('send-username', name);

    // Escuchar cuando un usuario se une al room
    socket.on('user-joined-room', (data) => {
        console.log(data);
    });

    // Recibir el mensaje al unirse
    socket.emit('room-info', {room: "room1"});

    socket.on('room-info-players', (data) => {
        console.log(data);
    });
});
