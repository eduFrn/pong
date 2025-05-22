import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const sockets = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const game = {
    players: {},
    rooms: {}
};

sockets.on("connection", (socket) => {
    console.log(`${socket.id} conectado`);

    const name = "Player_" + socket.id.substring(0, 5);
    game.players[socket.id] = { name };
    refreshPlayers();
    sendMessage(game.players[socket.id], 'conectado')

    socket.on('disconnect', () => {
        sendMessage(game.players[socket.id], 'saiu')
        delete game.players[socket.id];
        refreshPlayers();
    })

    socket.on('SendMessage', message => {
        sendMessage(game.players[socket.id],message)
    })

    socket.on('CreateRoom', () => {
        socket.join(socket.id)

        game.rooms[socket.id] = {
            player1: socket.id,
            player2: undefined
        }

        game.players[socket.id].room = socket.id

        refreshPlayers()
        refreshRooms()
        sendMessage(game.players[socket.id], 'criou uma sala')
    })

    socket.on('LeaveRoom', () =>{
        const roomId = game.players[socket.id].room
        const room = game.rooms[roomId]

        if(socket.id == room.player1){
            room.player1 = undefined
        }else{
            room.player2 = undefined
        }

        if(!room.player1 && !room.player2){
            delete game.rooms[roomId];
        }

        console.log(game.rooms)
    })

    console.log(game);
});

const sendMessage = (player, message) => {
    sockets.emit('ReceiveMessage', `${player.name}: ${message}`)
}

const refreshRooms = () => {
    sockets.emit("RoomsRefresh", game.rooms)
}

const refreshPlayers = () => {
    sockets.emit("PlayerRefresh", game.players)
}

app.get("/", (req, res) => res.send("ola"));

const port = 4000;
server.listen(port, () => console.log(`pong game listening on port ${port}`));
