import React from "react";

const Modal = (props) => {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999
        }}>
            <div style={{
                backgroundColor: 'black',
                padding: '1.5rem',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                borderRadius: '4px',
                zIndex: 1000,
                display: 'grid',
                gap: '8px',
                border: '8px solid white',
                color:'white',
                textAlign:'center'
            }}>
                <h4>{props.title}</h4>
                <hr/>
                {props.message}
                <button
                    style={{marginTop:'16px'}}
                    className="button"
                    onClick={props.leaveRoom}
                >
                    Sair
                </button>
            </div>
        </div>
    );
}

export default Modal;
