// Función para obtener el valor de una cookie por nombre
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');

    if(!token) window.location.href = '/login';
    fetch('/api/auth/user', {
        method: 'GET',
        headers: {
            'x-access-token': token,
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener el usuario.');
        }
        return response.json();
    })
    .then(user => {
        document.getElementById('welcome-message').textContent = `${user.nombre}, bienvenido al dashboard`;
    })
    .catch(err => {
        console.error('Error:', err.message);
    });

});

document.getElementById('logoutButton').addEventListener('click', async function() {
    try {
        localStorage.removeItem('token');
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });
        if (response.ok) {
            window.location.href = '/login'; // Redirige al login después de cerrar sesión
        } else {
            console.log('Error al cerrar sesión')
        }
    } catch (err) {
        console.log('Error al cerrar sesión')
    }
});

document.getElementById('cargarTemas').addEventListener('click', async function() {
    try {
        const token = localStorage.getItem('token');

        if(!token) window.location.href = '/login';

        window.location.href = '/dashboard/cargartemas';
    } catch (err) {
        console.log('Error al cerrar sesión')
    }
});

