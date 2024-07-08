import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.PORT || 'http://localhost:3000',
        methods: ["GET", "POST"],
    },
});

io.on('connection', (socket) => {
    console.log("User connected", socket.id);

    socket.on('join_room', (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    })

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    })
})


server.listen(3001, () => {
    console.log('Server listening on *:3001');
})