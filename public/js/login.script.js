document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const contrasenia = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, contrasenia }),
        });

        const data = await response.json();

        if (response.status === 200 && data.auth) {
            localStorage.setItem('token', data.token);

            window.location.href = '/dashboard';
        } else {
            console.log('Error en las credenciales');
        }
    } catch (err) {
        console.log('Error en la solicitud: ' + err.message);
    }
});