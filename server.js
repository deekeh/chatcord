const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');
const formatMessages = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));


const botname = 'Admin'
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        socket.emit('msg', formatMessages(botname, 'Welcome to ChatCord'));
        socket.broadcast.to(user.room).emit('msg', formatMessages(botname, `${user.username} has joined`));

        // send room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // get message
    socket.on('chatMsg', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('msg', formatMessages(user.username, msg));
    });

    // disconnect a user
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit('msg', formatMessages(botname, `${user.username} has left`));
        }

        // send room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });
});

const PORT = 3000 | process.env.PORT;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
