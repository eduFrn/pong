import React, { useContext } from "react";
import { GameContext, joinRoom, leaveRoom, createRoom } from "../contexts/GameContext";

const Rooms = () => {
	const { player, rooms } = useContext(GameContext)

	return (
		<div>
			<h3 className="card-title">
				Salas
				{
					!player.room &&
					<button className="button" onClick={createRoom}>Criar sala</button>
				}
			</h3>

			{
				!player.room &&
				<div>

					{Object.keys(rooms).map((key) =>
						<div key={`room_${key}`}>
							{rooms[key].name}
							<button className="button" onClick={() => joinRoom(key)} disabled={rooms[key].player1 && rooms[key].player2}>Entrar na sala</button>
						</div>
					)}
				</div>
			}
			{
				player.room && rooms[player.room]  &&
				<div>
					{rooms[player.room].player1 && rooms[player.room].player2 ?
						<button className="button"> Iniciar jogo </button>
						:
						<>
							Aguardando outro jogador
							<button className="button" onClick={leaveRoom}>Sair da sala</button>
						</>}
				</div>
			}
		</div>

	)
}

export default Rooms;