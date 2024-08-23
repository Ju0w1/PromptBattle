document.addEventListener('DOMContentLoaded', function() {
    const name = localStorage.getItem('username');

    if(!name) window.location.href = '/';

    document.getElementById('welcome-message').textContent = `Bienvenido ${name}`;

});

document.getElementById('logoutButton').addEventListener('click', async function() {
    localStorage.removeItem('username');
    window.location.href = '/';
});