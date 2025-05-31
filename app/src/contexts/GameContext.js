import React, { useReducer, useEffect, useRef } from "react";
import { io } from "socket.io-client";

const GameContext = React.createContext();

const reducer = (state, action) => {
    switch (action.type) {
        case 'CONNECTED':
            return {
                ...state,
                isConnected: action.payload
            }
        case 'PLAYERS':
            return {
                ...state,
                players: action.payload
            }
        case 'PLAYER':
            return {
                ...state,
                player: action.payload
            }
        case 'ADD_MESSAGES':
            return {
                ...state,
                messages: [...state.messages, action.payload]
            }
        case 'ROOMS':
            return {
                ...state,
                rooms: action.payload
            }
        case 'ROOM':
            return {
                ...state,
                room: state.rooms[state.players[action.payload].room]
            }
        case 'MATCH':
            return {
                ...state,
                match: action.payload
            }
        case 'MATCH_CLEAR':
            return {
                ...state,
                match: null
            }
        default:
            return state
    }
}

const initialState = {
    isConnected: false,
    messages: [],
    players: {},
    player: {},
    room: {},
    rooms: {},
    match: {}
}

const socket = new io("http://localhost:4000", {
    autoConnect: false
});

const GameProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState)
    const pointSound = useRef(null);

    useEffect(() => {
        pointSound.current = new Audio('/sounds/point.wav');
    }, []);

    useEffect(() => {
        const onConnect = () => {
            dispatch({ type: 'CONNECTED', payload: true });
        };
        const onDisconnect = () => {
            dispatch({ type: 'CONNECTED', payload: false });
        };
        const onPlayerRefresh = (players) => {
            dispatch({ type: 'PLAYERS', payload: players });
            dispatch({ type: 'PLAYER', payload: players[socket.id] });
        };
        const onReceiveMessage = (receivedMessage) => {
            dispatch({ type: 'ADD_MESSAGES', payload: receivedMessage });
        };
        const onRoomsRefresh = (rooms) => {
            dispatch({ type: 'ROOMS', payload: rooms });
            dispatch({ type: 'ROOM', payload: socket.id });
        };
        const onMatchRefresh = (match) => {
            dispatch({ type: 'MATCH', payload: match });
        };

        const onMatchClear = () => {
            dispatch({ type: 'MATCH_CLEAR' });
        };

        const onPointScored = () => {
            if (pointSound.current) {
                pointSound.current.play();
            }
        };

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);
        socket.on("PlayerRefresh", onPlayerRefresh);
        socket.on("ReceiveMessage", onReceiveMessage);
        socket.on("RoomsRefresh", onRoomsRefresh);
        socket.on("MatchRefresh", onMatchRefresh);
        socket.on("MatchClear", onMatchClear);
        socket.on("PointScored", onPointScored);

        socket.open();

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            socket.off("PlayerRefresh", onPlayerRefresh);
            socket.off("ReceiveMessage", onReceiveMessage);
            socket.off("RoomsRefresh", onRoomsRefresh);
            socket.off("MatchRefresh", onMatchRefresh);
            socket.off("MatchClear", onMatchClear);
            socket.off("PointScored", onPointScored);
            socket.disconnect();
        };
    }, []);


    return (
        <GameContext.Provider value={state}>
            {props.children}
        </GameContext.Provider>
    )
}

const sendMessage = (message) => {
    socket.emit("SendMessage", message)
}

const createRoom = () => {
    socket.emit('CreateRoom')
}

const leaveRoom = () => {
    socket.emit('LeaveRoom')
}

const joinRoom = (roomId) => {
    socket.emit('JoinRoom', roomId)
}

const gameLoaded = () => {
    socket.emit('GameLoaded')
}

let lastType = undefined
const sendKey = (type, key) => {
    if (lastType === type)
        return

    lastType = type;
    socket.emit('SendKey', { type, key })
}

export {
    GameContext,
    GameProvider,
    sendMessage,
    createRoom,
    leaveRoom,
    joinRoom,
    gameLoaded,
    sendKey
}
