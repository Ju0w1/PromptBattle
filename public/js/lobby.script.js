document.addEventListener('DOMContentLoaded', function() {
    const name = localStorage.getItem('username');

    if(!name) window.location.href = '/';

    document.getElementById('welcome-message').textContent = `Bienvenido ${name}`;

    window.onload = () => {
        var socket = io();

        socket.emit('send-username', name);
    }

});

document.getElementById('logoutButton').addEventListener('click', async function() {
    localStorage.removeItem('username');
    window.location.href = '/';
});