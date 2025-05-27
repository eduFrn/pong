import React from "react";
import PlayerList from "./PlayerList";
import Chat from "./Chat";

import { useContext } from "react";
import { GameContext, sendMessage } from "../contexts/GameContext";
import Rooms from "./Rooms";
import Game from "./Game";

const Pong = () => {
	const { isConnected, messages, match } = useContext(GameContext)
	console.log(match.status)

	return (
		<>
			{!isConnected && <div>Conectando...</div>}


			{match.status && <Game/>}

			{!match.status && <div className="app">


			<div className="card h-100">
				<Rooms />
				<hr style={{marginBlock:"10px"}}/>
				<PlayerList />
			</div>

			<Chat sendMessage={sendMessage} messages={messages}/>
			</div>
			}
		</>
	);
};

export default Pong;
