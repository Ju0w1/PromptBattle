document.addEventListener('DOMContentLoaded', async function() {
    const name = localStorage.getItem('username');

    if (!name) window.location.href = '/';

    var socket = io();

    socket.emit('send-username', name);

    // socket.on('connect', () => {
    //     const storedSocketId = localStorage.getItem('socketId');
    //     console.log(storedSocketId)
    //     if (storedSocketId) {
    //         // Emitir un evento al servidor para restaurar la sesión
    //         socket.emit('restoreSession', { storedSocketId });
    //     }
    // });

    socket.on('room-info-players', (data) => {
        console.log(data);
    });
});
