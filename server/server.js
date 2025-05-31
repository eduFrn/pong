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
    width: 580,
    height: 320,
    maxScore: 5
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
    sendMessage(game.players[socket.id], 'conectado')
    refreshPlayers();
    refreshRooms();

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
                    name: game.players[room.player1].name,
                    ready: false,
                    x: 5,
                    y: gameConfig.height / 2 - 40,
                    height: 80,
                    width: 10,
                    speed: 8
                },
                player2: {
                    name: game.players[room.player2].name,
                    ready: false,
                    x: gameConfig.width - 15,
                    y: gameConfig.height / 2 - 40,
                    height: 80,
                    width: 10,
                    speed: 8
                },
                score1: 0,
                score2: 0,
                status: 'START',
                ball: {
                    width: 5,
                    xdirection: 1,
                    ydirection: 1,
                    xspeed: 5,
                    yspeed: 5 * (gameConfig.height / gameConfig.width),
                    x: gameConfig.width / 2,
                    y: gameConfig.height / 2
                }

            }

            gameInProgress(roomId);
        }

        refreshPlayers();
        refreshRooms();
        refreshMatch(roomId)
        sendMessage(game.players[socket.id], 'entrou numa sala')
    })

    socket.on('GameLoaded', () => {
        const roomId = game.players[socket.id].room;
        const match = game.match[roomId];
        const player = 'player' + (game.rooms[roomId].player1 == socket.id ? 1 : 2);

        match[player] = {
            ...match[player],
            ready: true
        };

        if (match.player1.ready && match.player2.ready) {
            match.status = 'PLAY';
            restartMatch(match, roomId);
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
    const socketId = socket.id;
    const roomId = game.players[socketId]?.room;
    if (!roomId) return; // jogador não está em sala

    const room = game.rooms[roomId];

    if (room) {
        const match = game.match[roomId];

        game.players[socketId].room = undefined;

        const playerNumber = 'player' + (socketId === room.player1 ? 1 : 2);
        room[playerNumber] = undefined;

        // Expulsa o outro jogador também
        const otherPlayerNumber = playerNumber === 'player1' ? 'player2' : 'player1';
        const otherPlayerId = room[otherPlayerNumber];

        if (otherPlayerId) {
            const otherSocket = sockets.of("/").sockets.get(otherPlayerId);
            if (otherSocket) {
                otherSocket.leave(roomId);
                game.players[otherPlayerId].room = undefined;

                otherSocket.emit('MatchClear'); // notifica o outro que a partida acabou
            }

            room[otherPlayerNumber] = undefined;
        }

        if (match) {
            match.status = 'END';
            match.message = `O jogador ${game.players[socketId].name} desconectou. Partida finalizada.`;
        }

        if (!room.player1 && !room.player2) {
            delete game.rooms[roomId];
            if (match) {
                delete game.match[roomId];
            }
        }

        refreshMatch(roomId);
        refreshRooms();
        refreshPlayers();

        socket.leave(roomId);
        socket.emit('MatchClear'); // também para o jogador que saiu
    }
}

const gameInProgress = (roomId) => {
    const match = game.match[roomId];
    if (!match || match.status === 'END') {
        return;
    }

    if (match.status === 'PLAY') {
        moveBall(match);
        movePaddle(match);
        checkCollision(match, roomId);
    }

    refreshMatch(roomId);

    setTimeout(() => gameInProgress(roomId), 1000 / 30);
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

const checkCollision = (match, roomId) => {
    const { ball, gameConfig } = match;

    if (ball.y > gameConfig.height - ball.width) {
        ball.y = gameConfig.height - (ball.width * 2);
        ball.ydirection = -1;
    }

    if (ball.y < ball.width) {
        ball.y = ball.width * 2;
        ball.ydirection = 1;
    }

    const { x: bx, y: by, width: br } = ball;

    const playerNumber = bx < gameConfig.width / 2 ? 1 : 2;
    const player = `player${playerNumber}`;
    const { x: rx, y: ry, width: rw, height: rh } = match[player];

    let testX = bx;
    let testY = by;

    if (bx < rx) {
        testX = rx;
    }
    else if (bx > rx + rw) {
        testX = rx + rw;
    }

    if (by < ry) {
        testY = ry;
    }
    else if (by > ry + rh) {
        testY = ry + rh;
    }

    const distX = bx - testX;
    const distY = by - testY;
    const distance = Math.sqrt((distX * distX) + (distY * distY));

    if (distance <= br) {
        ball.xdirection *= -1;
        ball.x = playerNumber === 1 ? match[player].x + match[player].width + br : match[player].x - br;

        const quarterTop = by < ry + (rh / 4);
        const quarterBottom = by > ry + rh - (rh / 4);
        const halfTop = by < ry + (rh / 2);
        const halfBottom = by > ry + rh - (rh / 2);

        if (quarterTop || quarterBottom) {
            ball.yspeed += 0.15;
            ball.xspeed -= 0.15;

            ball.ydirection = quarterBottom ? 1 : -1;
        } else if (halfTop || halfBottom) {
            ball.yspeed += 0.05;
            ball.xspeed -= 0.05;
        }

        ball.xspeed *= 1.1;
    } else if (ball.x < ball.width) {
        match.score2++;
        sockets.to(roomId).emit('PointScored', { player: 2, score1: match.score1, score2: match.score2 });
        restartMatch(match, roomId);
    } else if (ball.x > gameConfig.width - ball.width) {
        match.score1++;
        sockets.to(roomId).emit('PointScored', { player: 1, score1: match.score1, score2: match.score2 });
        restartMatch(match, roomId);
    }
};

const restartMatch = (match, roomId) => {
    const prevDirection = match.ball?.xdirection || 1;

    match.ball = {
        width: 5,
        xdirection: -prevDirection,
        ydirection: 1,
        xspeed: 5,
        yspeed: 5 * (match.gameConfig.height / match.gameConfig.width),
        x: match.gameConfig.width / 2,
        y: match.gameConfig.height / 2
    };

    if (match.score1 === match.gameConfig.maxScore || match.score2 === match.gameConfig.maxScore) {
        const playerNumber = match.score1 === match.gameConfig.maxScore ? 1 : 2;
        const playerSocketId = game.rooms[roomId][`player${playerNumber}`];

        match.status = 'END';
        match.message = `O jogador ${game.players[playerSocketId].name} venceu!`;
    }

    refreshRooms();
    refreshMatch(roomId);
};

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
