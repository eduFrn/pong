import React, { useContext } from "react";
import { GameContext } from "../contexts/GameContext";

const PlayerList = () => {

    const {players} = useContext(GameContext)

    return(
        <div>
            <h3 className="card-title">Jogadores</h3>
            {Object.keys(players).map((key) => (
                <div key={key}>{players[key].name}</div>
            ))}
        </div>
    )
}

export default PlayerList;