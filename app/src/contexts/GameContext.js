import React, { useReducer, useEffect } from "react";
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
        case 'ADD_MESSAGES':
            return {
                ...state,
                messages: [...state.messages, action.payload]
            }
        default:
            return state
    }
}

const initialState = {
    isConnected: false,
    messages: [],
    players: {}
}

const socket = new io("http://localhost:4000", {
    autoConnect: false
});

const GameProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {

        socket.on("connect", () => {
            console.log("Conectado!");
            dispatch({ type: 'CONNECTED', payload: true })
        });
        socket.on("disconnect", () => {
            console.log("Desconectado!");
            dispatch({ type: 'CONNECTED', payload: false })
        });

        socket.on('PlayerRefresh', (players) => {
            dispatch({ type: 'PLAYERS', payload: players })
        })

        const handleReceiveMessage = (receivedMessage) => {
            dispatch({ type: 'ADD_MESSAGES', payload: receivedMessage });
        };

        socket.on('ReceiveMessage', handleReceiveMessage);

        socket.open()

        return () => {
            socket.off("PlayerRefresh");
            socket.off("ReceiveMessage", handleReceiveMessage);
            socket.disconnect();
        };
    }, [])

    return (
        <GameContext.Provider value={state}>
            {props.children}
        </GameContext.Provider>
    )
}

const sendMessage = (message) => {
    socket.emit("SendMessage", message)
}

const removeEventListener = (event, socket) => {
    const listeners = socket.listeners(event)
    Object.keys(listeners).forEach(key => socket.removeEventListener(event, listeners[key]))
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

export { GameContext, GameProvider, sendMessage, createRoom, leaveRoom, joinRoom }
