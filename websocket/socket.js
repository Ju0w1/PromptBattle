const users = []
const rooms = []

module.exports = function(io) {
    io.on('connection', (socket) => {
        
        let roomData = {}
        let roomUsers = []
        socket.on('send-username', function(username) {
            let user = socket.handshake.session.user;
    
            if (!user) {
                user = addUser(username);
                socket.handshake.session.user = user;
                socket.handshake.session.save();
    
                console.log(`${user.name} se conecto`);
            }
    
    
        });
    
        socket.on('disconnect', () => {
            try{
                const username = socket.handshake.session.user.name
    
                console.log(`${username} se desconecto`);
            }catch(err){
                console.log(err)
            }
        });

        socket.on('join-room', (datos) => {
            try {
                const username = socket.handshake.session.user.name;
                const message = `El usuario ${username} se unió a la partida con tema: ${datos.tema}`;

                console.log(message);
                
                socket.join(datos.room);

                roomUsers.push(username);

                roomData = {
                    room: datos.room,
                    tema: datos.tema,
                    users: roomUsers
                }

                rooms.push(roomData);

                // Enviar el mensaje a todos los usuarios del room
                io.to(datos.room).emit('user-joined-room', username);

            } catch (err) {
                console.log(err);
            }
        });

        socket.on('room-info', (datos) => {
            try {
                const theRoom = datos.room;

                const roomInfo = rooms.find(room => room.room === theRoom);

                if (roomInfo) {
                    io.to(roomInfo.room).emit('room-info-players', roomInfo);
                } else {
                    io.to(roomInfo.room).emit('room-info-players', { message: 'Room not found' });
                }
            } catch (err) {
                console.log(err);
            }
        });
    });
    
    function addUser(username) {
        const user = {
            name: username,
        };
        users.push(user);
        return user;
    }

}

