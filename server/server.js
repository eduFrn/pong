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

const gameConfig = {
    width: 520,
    height: 320
}

const game = {
    players: {},
    rooms: {},
    match: {}
};

sockets.on("connection", (socket) => {
    console.log(`${socket.id} conectado`);

    const name = "Player_" + socket.id.substring(0, 5);
    game.players[socket.id] = { name };
    refreshPlayers();
    sendMessage(game.players[socket.id], 'conectado')

    socket.on('disconnect', () => {
        sendMessage(game.players[socket.id], 'saiu')
        leaveRoom(socket);

        delete game.players[socket.id];
        refreshPlayers();
        refreshRooms();
    })

    socket.on('SendMessage', message => {
        sendMessage(game.players[socket.id], message)
    })

    socket.on('CreateRoom', () => {
        socket.join(socket.id)

        game.rooms[socket.id] = {
            name: `Sala do ${game.players[socket.id].name}`,
            player1: socket.id,
            player2: undefined
        }

        game.players[socket.id].room = socket.id

        refreshPlayers()
        refreshRooms()
        sendMessage(game.players[socket.id], 'criou uma sala')
    })

    socket.on('LeaveRoom', () => {
        leaveRoom(socket);
        refreshPlayers();
        refreshRooms();
    })

    socket.on('JoinRoom', (roomId) => {
        socket.join(roomId)

        const position = game.rooms[roomId].player1 ? '2' : '1';

        game.rooms[roomId][`player${position}`] = socket.id;

        game.players[socket.id].room = roomId;

        const room = game.rooms[roomId]
        if (room.player1 && room.player2) {
            game.match[roomId] = {
                gameConfig,
                player1: {
                    ready: false,
                    x: 5,
                    y: gameConfig.height / 2 - 40,
                    height: 80,
                    width: 10,
                    speed: 5
                },
                player2: {
                    ready: false,
                    x: gameConfig.width - 15,
                    y: gameConfig.height / 2 - 40,
                    height: 80,
                    width: 10,
                    speed: 5
                },
                score1: 0,
                score2: 0,
                status: 'START',
                ball: {}
            }
        }

        refreshPlayers();
        refreshRooms();
        refreshMatch(roomId)
        sendMessage(game.players[socket.id], 'entrou numa sala')
    })


    socket.on('GameLoaded', () => {
        const socketId = socket.id;
        const roomId = game.players[socketId].room;
        const room = game.rooms[roomId];
        const match = game.match[roomId];

        const player = socketId === room.player1 ? 'player1' : 'player2';

        match[player] = { ...match[player], ready: true }

        if (match.player1.ready && match.player2.ready) {
            match.status = 'PLAY'
            match.ball = {
                width: 5,
                xdirection: 1,
                ydirection: 1,
                xspeed: 2.8,
                yspeed: 2.2,
                x: gameConfig.width / 2,
                y: gameConfig.height / 2
            }

            gameInProgress(roomId)
        }
    })

    socket.on('SendKey', ({ type, key }) => {
        const socketId = socket.id;
        const roomId = game.players[socketId].room;
        const room = game.rooms[roomId];
        const match = game.match[roomId];
        const player = socketId === room.player1 ? 'player1' : 'player2';
        const direction = type == 'keyup' ? 'STOP' : key.replace('Arrow', '').toUpperCase()

        match[player] = { ...match[player], direction }
    })
});

const leaveRoom = (socket) => {
    const socketId = socket.id
    const roomId = game.players[socketId].room
    const room = game.rooms[roomId]

    if (room) {
        const match = game.match[roomId]

        game.players[socketId].room = undefined

        const playerNumber = socketId === room.player1 ? 'player1' : 'player2';
        room[playerNumber] = undefined


        if (match) {
            match[playerNumber] = undefined
            match.status = 'END'
            match.message = `O jogador ${game.players[socketId].name} desconectou`
        }


        if (!room.player1 && !room.player2) {
            delete game.rooms[roomId];
            if (match) {
                delete game.match[roomId]
            }
        }

        refreshMatch(roomId)
        socket.leave(roomId)
    }
}

const gameInProgress = (roomId) => {
    const match = game.match[roomId]
    if (!match || match.status === 'END')
        return;

    const { ball } = match;

    switch (match.status) {
        case 'PLAY':

            moveBall(match)
            movePaddle(match)
            checkCollision(match)

            break;
    }

    console.log(`Velocidade bola: xspeed=${ball.xspeed.toFixed(2)}, yspeed=${ball.yspeed.toFixed(2)}`);

    refreshMatch(roomId);
    setTimeout(() => gameInProgress(roomId), 1000 / 60);
}

const moveBall = ({ ball }) => {
    const xpos = ball.x + ball.xspeed * ball.xdirection;
    const ypos = ball.y + ball.yspeed * ball.ydirection;

    ball.x = xpos
    ball.y = ypos
}

const movePaddle = (match) => {
    [1, 2].forEach(i => {
        const player = match[`player${i}`]

        switch (player.direction) {
            case 'UP':
                player.y -= player.speed;
                break;
            case 'DOWN':
                player.y += player.speed;
                break;
        }

        if (player.y < 0)
            player.y = 0
        else if (player.y + player.height > match.gameConfig.height)
            player.y = match.gameConfig.height - player.height

    })
}

const checkCollision = (match) => {
    const { ball, gameConfig } = match

    if (ball.y > match.gameConfig.height - ball.width || ball.y < ball.width)
        ball.ydirection *= -1

    const { x: bx, y: by, width: br } = ball

    const playerNumber = bx < gameConfig.width / 2 ? 1 : 2
    const player = `player${playerNumber}`

    const { x: rx, y: ry, width: rw, height: rh } = match[player]

    let testX = bx;
    let testY = by;

    if (bx < rx) {
        testX = rx;
    } else if (bx > rx + rw) {
        testX = rx + rw;
    }

    if (by < ry) {
        testY = ry;
    } else if (by > ry + rh) {
        testY = ry + rh;
    }

    const distX = bx - testX;
    const distY = by - testY;
    const distance = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

    if (distance <= br) {
        ball.xdirection *= -1
        ball.x = playerNumber === 1 ? match[player].x + match[player].width + br : match[player].x - br
    } else if (ball.x < ball.width) {
        match.score2++;
        ball.xdirection = 1
        restartMatch(match)
    } else if (ball.x > gameConfig.width - ball.width) {
        match.score1++;
        ball.xdirection = -1
        restartMatch(match)
    }
}

const restartMatch = (match) => {
    const { ball, gameConfig } = match

    ball.x = gameConfig.width / 2
    ball.y = gameConfig.height / 2
}

const sendMessage = (player, message) => {
    sockets.emit('ReceiveMessage', `${player.name}: ${message}`)
}

const refreshRooms = () => {
    sockets.emit("RoomsRefresh", game.rooms)
}

const refreshPlayers = () => {
    sockets.emit("PlayerRefresh", game.players)
}

const refreshMatch = (roomId) => {
    sockets.to(roomId).emit('MatchRefresh', game.match[roomId])
}

app.get("/", (req, res) => res.send("ola"));

const port = 4000;
server.listen(port, () => console.log(`pong game listening on port ${port}`));
