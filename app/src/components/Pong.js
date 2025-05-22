import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import PlayerList from "./PlayerList";
import Chat from "./Chat";

let socket

const Pong = () => {

	const [players, setPlayers] = useState({})
	const [messages, setMessages] = useState('')


	useEffect(() => {
		socket = new io("http://localhost:4000");
		socket.on("connect", () => {
			console.log("conectado!");
		});
	}, []);

	useEffect(() => {
		
		socket.on('PlayerRefresh', (players) => {
			setPlayers(players)
		})

	},[players])

	useEffect(() => {
		socket.on('ReceiveMessage', (receivedMessage) => {
			setMessages(messages + "\n" + receivedMessage)
		})
	}, [messages])

	const sendMessage = (message) => {
		socket.emit("SendMessage", message)
	}

	return (
		<div>
			<PlayerList players={players} />
			<Chat sendMessage={sendMessage} messages={messages} />
		</div>
	);
};

export default Pong;
