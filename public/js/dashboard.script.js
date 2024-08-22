// Función para obtener el valor de una cookie por nombre


document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');

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
        // Aquí manejas los datos del usuario
        console.log('Usuario obtenido:', user);
        // Ejemplo: Mostrar el nombre de usuario en la página
        document.getElementById('welcome-message').textContent = `Bienvenido al dashboard, ${user.nombre}`;
    })
    .catch(err => {
        console.error('Error:', err.message);
    });

    // if (nombre) {
    //     document.getElementById('welcome-message').textContent = `Bienvenido al dashboard, ${nombre}`;
    // } else {
    //     // Redirige al login si no se encuentra la información del usuario
    //     document.getElementById('welcome-message').textContent = `Bienvenido al dashboard, NaN`;
    // }
});

document.getElementById('logoutButton').addEventListener('click', async function() {
    try {
        localStorage.removeItem('token');
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
        });
        if (response.ok) {
            window.location.href = '/'; // Redirige al login después de cerrar sesión
        } else {
            alert('Error al cerrar sesión');
        }
    } catch (err) {
        alert('Error al cerrar sesión: ' + err.message);
    }
});