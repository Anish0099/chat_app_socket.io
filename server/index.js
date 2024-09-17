import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import path from 'path';

const app = express();
app.use(cors());

const server = http.createServer(app);

// Check the frontend
if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(__dirname, 'client', '.next');
    app.use(express.static(clientPath));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(clientPath, 'server/app/index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ message: 'Hello from server!' });
    });
}

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

io.on('connection', (socket) => {
    console.log("User connected", socket.id);

    socket.on('join_room', (data) => {
        socket.join(data);
        console.log(`User with ID: ${socket.id} joined room: ${data}`);
    });

    socket.on("send_message", (data) => {
        socket.to(data.room).emit("receive_message", data)
    });

    socket.on('disconnect', () => {
        console.log('User disconnected', socket.id);
    });
});

server.listen(3001, () => {
    console.log('Server listening on *:3001');
});
