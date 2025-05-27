import React, { useContext, useEffect, useState } from "react";
import SVG, { Circle, Rect, Line } from "react-svg-draw";

import { GameContext, gameLoaded, leaveRoom, sendKey } from "../contexts/GameContext";

const Game = () => {
    const { match } = useContext(GameContext);
    const { gameConfig, ball, message, player1, player2} = match;

    const [scale, setScale] = useState(1);

    useEffect(() => {
        gameLoaded();

        const sendKeyEvent = (e) => {
            const { key, type } = e

            switch (key) {
                case 'ArrowUp':
                case 'ArrowDown':
                    sendKey(type, key);
                    e.preventDefault();
                    break;
            }
        }

        document.addEventListener('keydown', sendKeyEvent)
        document.addEventListener('keyup', sendKeyEvent)

        return () => {
            document.removeEventListener('keydown', sendKeyEvent)
            document.removeEventListener('keyup', sendKeyEvent)
        }

    }, []);

    useEffect(() => {
        const updateScale = () => {
            const scaleX = window.innerWidth / gameConfig.width;
            const scaleY = window.innerHeight / gameConfig.height;
            setScale(Math.min(scaleX, scaleY));
        };

        updateScale();
        window.addEventListener("resize", updateScale);

        return () => window.removeEventListener("resize", updateScale);

    }, [gameConfig.width, gameConfig.height]);


    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#111",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    width: gameConfig.width,
                    height: gameConfig.height,
                    position: "relative",
                }}
            >
                <SVG width={gameConfig.width} height={gameConfig.height}>
                    <Rect
                        width={gameConfig.width}
                        height={gameConfig.height}
                        x="0"
                        y="0"
                        style={{ fill: "#000" }}
                    />

                    <Line
                        x1={gameConfig.width / 2}
                        y1="0"
                        x2={gameConfig.width / 2}
                        y2={gameConfig.height}
                        strokeDasharray="1,1"
                        strokeWidth="1"
                        style={{ stroke: "rgba(255,255,255,0.2)" }}
                    />

                    <text
                        x={8}
                        y='24'
                        style={{ fontSize: '24px', fill: "rgba(255,255,255,0.6)", fontFamily: 'consolas' }}
                    >
                        {match.score1}
                    </text>

                    <text
                        x={gameConfig.width - 8}
                        y='24'
                        textAnchor="end"  // Alinha o texto à direita
                        style={{ fontSize: '24px', fill: "rgba(255,255,255,0.6)", fontFamily: 'consolas' }}
                    >
                        {match.score2}
                    </text>

                    {ball &&
                        <Circle cx={ball.x} cy={ball.y} r={ball.width} style={{ fill: "#fff" }} />
                    }

                    {player1 && 
                        <Rect
                            width={player1.width.toString()}
                            height={player1.height.toString()}
                            x={player1.x.toString()}
                            y={player1.y.toString()}
                            style={{ fill: "#fff" }}
                        />
                    }

                    {player2 && 
                        <Rect
                            width={player2.width.toString()}
                            height={player2.height.toString()}
                            x={player2.x.toString()}
                            y={player2.y.toString()}
                            style={{ fill: "#fff" }}
                        />
                    }


                </SVG>

                {message && (
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: "#fff" }}>
                        <h4>{message}</h4>
                        <button onClick={leaveRoom}>Sair</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Game;
