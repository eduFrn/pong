import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../contexts/GameContext";

const Chat = (props) => {

    const [messageToSend, setMessageToSend] = useState('')

    const sendMessage = () => {
        props.sendMessage(messageToSend)
        setMessageToSend('')
    }

    useEffect(() => {
        const elemt = document.querySelector('#chat-content')
        elemt.scrollTop = elemt.scrollHeight
    }, [props.messages])

    return (
        <div style={{display:'flex', flexDirection:'column'}}>
            <div id="chat-content" className="messages-container">{props.messages.join("\n")}</div>
            <div className="input-wrapper" style={{width:'100%'}}>
                <input
                    type="text"
                    value={messageToSend}
                    onChange={(e) => setMessageToSend(e.target.value)} 
                    onSubmit={(e) => sendMessage(e.target.value)} 
                />
                <button className="button" disabled={!messageToSend.trim()} onClick={() => sendMessage(messageToSend)}>Enviar</button>
            </div>
        </div>

    )
}

export default Chat;