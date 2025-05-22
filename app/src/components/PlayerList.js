import React from "react";

const PlayerList = (props) => {
    return(
        <div>
            {Object.keys(props.players).map((key) => (
                <div key={key}>{props.players[key].name}</div>
            ))}
        </div>
    )
}

export default PlayerList;