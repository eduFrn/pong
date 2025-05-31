import React, { useContext } from "react";
import { GameContext, joinRoom, leaveRoom, createRoom } from "../contexts/GameContext";

const Rooms = () => {
	const { player, rooms } = useContext(GameContext);

	if (player.room && rooms[player.room]) {
		const salaCheia = rooms[player.room].player1 && rooms[player.room].player2;

		return (
			<div style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				textAlign: 'center',
				padding: '2rem',
				color: 'white',
				gap: '1rem',
				background: '#222',
				marginTop: '2em', border: '1px solid #555',

				borderRadius: '8px',

			}}>
				<h2>{rooms[player.room].name || player.room}</h2>
				{salaCheia
					? <button className="button">Iniciar jogo</button>
					: <p>Aguardando outro jogador...</p>
				}
				<button className="button" onClick={leaveRoom}>Sair da sala</button>
			</div>
		);
	}

	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between',
			alignItems: 'center',
			height: '100%',
			padding: '2rem',
			color: 'white',
			background: 'black'
		}}>
			<h2 style={{ fontSize: '24px', marginBottom: '1rem' }}>Salas disponíveis</h2>

			<div style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				gap: '0.5rem',
				flexGrow: 1,
			}}>
				{Object.keys(rooms).length === 0 && <p>Nenhuma sala criada.</p>}
				{Object.keys(rooms)
					.filter(key => rooms[key].match?.status !== 'END')
					.map((key) => {
						const sala = rooms[key];
						const cheia = sala.player1 && sala.player2;

						return (
							<div
								key={`room_${key}`}
								style={{
									background: '#222',
									border: '1px solid #555',
									padding: '0.8rem 1.2rem',
									borderRadius: '8px',
									width: '250px',
									display: 'flex',
									justifyContent: 'space-between',
									alignItems: 'center',
								}}
							>
								<span>{sala.name || key}</span>
								<button
									className="button"
									onClick={() => joinRoom(key)}
									disabled={cheia}
									style={{ fontSize: '12px' }}
								>
									Entrar
								</button>
							</div>
						);
					})}
			</div>

			<button className="button" onClick={createRoom} style={{ marginTop: '2rem' }}>
				Criar sala
			</button>
		</div>
	);
};

export default Rooms;
