import React, { useContext, useEffect, useState } from "react";
import SVG, { Circle, Rect, Line } from "react-svg-draw";

import Modal from "./Modal";

import { GameContext, gameLoaded, leaveRoom, sendKey } from "../contexts/GameContext";

const Game = () => {
    const { match, player } = useContext(GameContext);
    const { gameConfig, ball, message, player1, player2 } = match;

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

    const scoreImages = [
        "/scores/0.png",
        "/scores/1.png",
        "/scores/2.png",
        "/scores/3.png",
        "/scores/4.png",
        "/scores/5.png"
    ];

    return (
        <div
            style={{
                width: "100vw",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#000",
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

                    {ball &&
                        <Circle cx={ball.x} cy={ball.y} r={ball.width} style={{ fill: "#fff" }} />
                    }

                    {player1 && (
                        <>
                            <Rect
                                width={player1.width.toString()}
                                height={player1.height.toString()}
                                x={player1.x.toString()}
                                y={player1.y.toString()}
                                style={{ fill: player1?.name === player?.name ? "#d4af37" : "#fff", stroke: player1?.name === player?.name ? "#8f7213" : "#aaa", strokeWidth: '2' }}
                            />
                            <text
                                x={(player1.x).toString()}
                                y={(player1.y < gameConfig.height / 2 ? player1.y + player1.height + 10 : player1.y - 10).toString()}
                                style={{ fill: "#ffffff66", fontSize: 8, fontFamily: "monospace", fontWeight: 'bold' }}
                                textAnchor="left"
                            >
                                {player1?.name === player?.name ? "VOCÊ" : player1?.name.replace("Player_", "") ?? "P1"}
                            </text>
                        </>
                    )}

                    {player2 && (
                        <>
                            <Rect
                                width={player2.width.toString()}
                                height={player2.height.toString()}
                                x={player2.x.toString()}
                                y={player2.y.toString()}
                                style={{ fill: player2?.name === player?.name ? "#d4af37" : "#fff", stroke: player2?.name === player?.name ? "#8f7213" : "#aaa", strokeWidth: '2' }}
                            />
                            <text
                                x={(player2.x - player2.width).toString()}
                                y={(player2.y < gameConfig.height / 2 ? player2.y + player2.height + 10 : player2.y - 10).toString()}
                                style={{ fill: "#ffffff66", fontSize: 8, fontFamily: "monospace", fontWeight: 'bold' }}
                                textAnchor="right"
                            >
                                {player2?.name == player?.name ? "VOCÊ" : player2?.name.replace("Player_", "") ?? "P1"}
                            </text>
                        </>
                    )}

                    <image
                        href={scoreImages[match.score1] || scoreImages[0]}
                        x={8}
                        y={0}  // ajuste vertical para centralizar a imagem no topo
                        height={30}  // altura da imagem (ajuste conforme quiser)
                        width={20}   // largura da 
                        style={{ imageRendering: 'pixelated', zIndex:99999 }}
                    />

                    <image
                        href={scoreImages[match.score2] || scoreImages[0]}
                        x={gameConfig.width - 28}  // 8 + 20 (largura) para alinhar a direita com margem
                        y={0}
                        height={30}
                        width={20}
                        style={{ imageRendering: 'pixelated', zIndex:99999 }}
                    />

                </SVG>
            </div>
 {message && (
  message.includes(player.name) ? (
    <Modal title={"Fim de jogo"} message={message.replace("O jogador "+player.name,"Você")} leaveRoom={leaveRoom} />
  ) : (
    <Modal title={"Fim de jogo"} message={message} leaveRoom={leaveRoom} />
  )
)}

        
        </div>
    );
};

export default Game;
