import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import PlayerList from "./PlayerList";
import Chat from "./Chat";

const removeEventListener = (event, socket) => {
	const listeners = socket.listeners(event)
	Object.keys(listeners).forEach(key => socket.removeEventListener(event, listeners[key]))
}

const Pong = () => {

	const socket = useRef(null)

	const [players, setPlayers] = useState({})
	const [messages, setMessages] = useState('')
	const [isConnected, setIsConnected] = useState(false)


	useEffect(() => {
		socket.current = new io("http://localhost:4000", {
			autoConnect: false
		});

		const s = socket.current

		s.on("connect", () => {
			console.log("Conectado!");
			setIsConnected(true)
		});
		s.on("disconnect", () => {
			console.log("Desconectado!");
			setIsConnected(false)
		});


			s.on('PlayerRefresh', (players) => {
				setPlayers(players)
			})
		
		const handleReceiveMessage = (receivedMessage) => {
			setMessages(prev => prev + "\n" + receivedMessage);
		};

		s.on('ReceiveMessage', handleReceiveMessage);

		s.open()

		return () => {
			s.off("PlayerRefresh");
			s.off("ReceiveMessage", handleReceiveMessage);
			s.disconnect();
		};
	}, [])

	const sendMessage = (message) => {
		socket.current.emit("SendMessage", message)
	}

	return (
		<>
			{!isConnected && <div>Conectando...</div>}
			<div>
				<PlayerList players={players} />
				<Chat sendMessage={sendMessage} messages={messages} />
			</div>
		</>
	);
};

export default Pong;
