
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');


const app = express();
const server = http.createServer(app);
const io = new Server(server);


app.use(express.static(path.resolve("./public")));

app.get("/",(req,res)=>{

    return res.sendFile("/public/index.html")
}); 



const connectedUsers = {};


io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('login', ({ username, passkey }) => {
        const validUsers = {
            ARYAN: "key123",
            SHIVAM: "key234",
            ATUL: "key345",
            RAVI: "key456",
            SHIKHIL: "key567",
        };

        if (validUsers[username] && validUsers[username] === passkey) {
            connectedUsers[socket.id] = username;
            socket.emit('loginSuccess', { username });
            io.emit('userList', Object.values(connectedUsers));
            console.log(`${username} logged in.`);
        } else {
            socket.emit('loginError', 'Invalid username or passkey');
        }
    });


    socket.on('sendMessage', (message) => {
        const username = connectedUsers[socket.id];
        if (username) {
            io.emit('newMessage', { username, message });
            console.log(`${username}: ${message}`);
        }
    });

    
    socket.on('disconnect', () => {
        const username = connectedUsers[socket.id];
        delete connectedUsers[socket.id];
        io.emit('userList', Object.values(connectedUsers));
        if (username) {
            console.log(`${username} disconnected.`);
        }
    });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
