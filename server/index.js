const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"],
    },
});

const messageStore = {}

io.on("connection", (socket) => {
    console.log("User Connected: ", socket.id);

    socket.on('join_room', (room) => {
        socket.join(room.roomId);
        // io.to(room.roomId).emit('receive_message', messageStore[room.roomId]);
        if(messageStore[room.roomId]){
            io.emit('receive_message', messageStore[room.roomId]);
        }
        console.log(`${room.user} joined the room: ${room.roomId}`);
    });
    
    socket.on('leave_room', (room) => {
        socket.leave(room.roomId);
        console.log(`${room} left the room: ${room.roomId}`);
    });

    socket.on('send_message', (data) => {
        if(messageStore[data.roomId]){
            messageStore[data.roomId].push(data);
        }else {
            messageStore[data.roomId] = [data]
        }
        console.log(messageStore);
        io.to(data.roomId).emit('receive_message', messageStore[data.roomId]);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
})

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log(`Server is Running on Port ${PORT}`);
})