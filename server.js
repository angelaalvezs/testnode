const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const msgpackr = require('msgpackr');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;
// Configuração para servir arquivos estáticos (como seu arquivo HTML)
app.use(express.static(__dirname + '/public'));

let serverPlayers = {};

const io = socketIo(server, {
    cors: {
        origin: '*',
    }
});

// { "x": 0, "y": 0, "r": 0 "d": 0};
// r = running T/F
// d = running_dir 0/UP 1/DOWN 2/LEFT 3/RIGHT

io.on('connection', (socket) => {
    console.log("New User");

    serverPlayers[socket.id] = { "x": 0, "y": 0 };
    socket.broadcast.emit("new_player_enter", socket.id);

    io.to(socket.id).emit("get_players_in_room", Object.keys(serverPlayers));

    socket.on("disconnect", () => {
        delete serverPlayers[socket.id];
        socket.broadcast.emit("new_player_close", socket.id);
    });

    socket.on("player_pos_update", (data) => {
        io.emit("player_moved", data);
    });

    socket.on("toggle_running", (data) => {
        io.emit("player_toggle_running", { "r": data, id: socket.id });
    });

    socket.on("toggle_running_dir", (data) => {
        io.emit("player_toggle_running_dir", { "d": data, id: socket.id });
    });
});

server.listen(port, () => {
    console.log('localhost:3000');
});
