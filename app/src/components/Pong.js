import React, { useContext } from "react";
import Rooms from "./Rooms";
import Game from "./Game";

import { GameContext, sendMessage } from "../contexts/GameContext";

const Pong = () => {
  const { isConnected, match, player, messages } = useContext(GameContext);

  // Checa se o match é um objeto com propriedade 'status' definida e diferente de vazio/null
  const isMatchActive = match && typeof match === 'object' && match.status;

  return (
    <>
      {/* Conexão ainda não estabelecida */}
      {!isConnected && (
        <div style={{ background: 'black', height: '100vh', display:'grid', placeItems:'center'}}>
          <h2 style={{ color: "white", textAlign: "center" }}>Conectando...</h2>
        </div>
      )}

      {/* Jogo iniciado */}
      {isConnected && isMatchActive && <Game />}

      {/* Dentro de uma sala, aguardando outro jogador */}
      {isConnected && player.room && !isMatchActive && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            color: "white",
            fontFamily: "sans-serif",
            background: 'black',
          }}
        >
          <Rooms />
        </div>
      )}

      {/* Fora de qualquer sala */}
      {isConnected && !player.room && !isMatchActive && (
        <div style={{ background: 'black', height: '100%' }}>
          <div className="h-100" style={{ flex: 1 }}>
            <Rooms />
			<h3 style={{fontFamily:'monospace',position:'absolute', color:'white', bottom:'0', right:'0', padding:'1em'}}>Você é: <span style={{fontFamily:'monospace',color:'#0f0'}}>{player.name}</span></h3>
          </div>
        </div>
      )}
    </>
  );
};

export default Pong;
