document.addEventListener('DOMContentLoaded', async function() {
    const name = sessionStorage.getItem('username');
    const temaPartida = sessionStorage.getItem('temaPartida');
    const idPartida = sessionStorage.getItem('idPartida');

    if (!name || !temaPartida) window.location.href = '/';

    var socket = io();

    socket.emit('ingresar-partida', {username: name, tema:temaPartida, idPartida});

    socket.on('error-ingreso-partida', ()=>{
        window.location.href = '/'
    })

    socket.on('partida-completa', ()=>{
        window.location.href = '/lobby'
    })

    socket.on('actualizo-cantidad-players', (datos)=>{
        if(Number(datos.idPartida) === idPartida){
            const players = document.getElementById('players-count')
            players.textContent = `Battlers en la sala: ${datos.cantidad}`;
        }
    })  

    socket.on('nuevo-integrante', ()=>{
        console.log('Se unio alguien al room')
    })  

    socket.on('info-partida', (partida)=>{
        const tema = document.getElementById("tema")
        tema.textContent = partida.tema
    })

    const button = document.getElementById('submit')
    
    button.addEventListener('click', async ()=> {
        const textoObj = document.getElementById('texto')
        const texto = textoObj.value

        try{
            const loader = document.getElementById('loader') 
            loader.style.display = 'block';
            const response = await fetch('/partidas/generate',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ texto }),
            })

            const data = await response.json()

            if(response.status === 200 && data){
                const imagen = document.getElementById('imagen')
                imagen.src=data.image
            
                socket.emit('imagen-generada', { imagen: data.image })
            }else{
                console.log('Error al generar imagen');
            }
        }catch(error){
            console.log(error)
        }finally{
            const resultContainer = document.getElementById('result')
            loader.style.display = 'none';
            resultContainer.style.display = 'block';
        }
    })
});
