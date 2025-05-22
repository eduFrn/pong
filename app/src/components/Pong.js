import React, { useEffect, useRef, useState } from "react";
import PlayerList from "./PlayerList";
import Chat from "./Chat";

import { useContext } from "react";
import { createRoom, GameContext, joinRoom, sendMessage, leaveRoom} from "../contexts/GameContext";

const Pong = () => {
	const { isConnected, players, player, messages, rooms } = useContext(GameContext)

	return (
		<>
			{!isConnected && <div>Conectando...</div>}
			<div>
				{
					!player.room &&
					<div>
						<button onClick={createRoom}>Criar sala</button>
						{rooms.map((key) =>
							<div key={`room_${key}`}>
								{rooms[key].name}
								<button onClick={() => joinRoom(key)}>Entrar na sala</button>
							</div>
						)}
					</div>
				}
				{
					player.room &&
					<div>
						Aguardando outro jogador
						<button onClick={leaveRoom}>Sair da sala</button>
					</div>
				}
				<PlayerList players={players} />
				<Chat sendMessage={sendMessage} messages={messages} />
			</div>
		</>
	);
};

export default Pong;
