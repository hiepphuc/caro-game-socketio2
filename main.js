const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
const { v4: randomID } = require('uuid');

const app = express();
const server = createServer(app);
const io = new Server(server);

const userNames = [];
let count = 0;
const BOARD_SIZE = 20;

app.use(express.static('.'));

app.get('/', (req, res) => {
    console.log('hello');

    res.sendFile(join(__dirname, 'index.html'));
});

io.on('connection', (socket) => {
    console.log('a user connected');
    count++;

    socket.on('disconnect', () => {
        console.log('user disconnected');
        count--;
        userNames.splice(0, userNames.length);
    });

    if (count === 1) {
        const data = { playerSymbol: 'X', isCurrentPlayer: true }
        socket.emit('load player data', data);
    }
    if (count === 2) {
        const data = { playerSymbol: 'O', isCurrentPlayer: false }
        socket.emit('load player data', data);
    }

    socket.on('username submited', (userName) => {
        userNames.push(userName);
        const tempBoardData = Array(BOARD_SIZE).fill(null).map(_ => Array(BOARD_SIZE).fill(''));
        io.emit('load game', userNames, tempBoardData);
    });

    socket.on('load game', (boardData) => {
        io.emit('load game', userNames, boardData);
    });

});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});