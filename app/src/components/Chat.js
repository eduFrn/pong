import React, { useEffect, useState } from "react";

const Chat = (props) => {

    const [messageToSend, setMessageToSend] = useState('')

    return (
        <div>
            <div style={{whiteSpace:'pre'}}>{props.messages}</div>
            <input
                type="text"
                value={messageToSend}
                onChange={(e) => setMessageToSend(e.target.value)} 
            />
            <button onClick={() => props.sendMessage(messageToSend)}>Enviar</button>
        </div>

    )
}

export default Chat;