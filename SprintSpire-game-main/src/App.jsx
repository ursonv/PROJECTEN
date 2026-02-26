import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { KeyboardControls } from "@react-three/drei";
import { Experience } from "./components/Experience";
import StartScreen from "./components/StartScreen";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "run", keys: ["Shift"] },
];

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [canMove, setCanMove] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [lastGameTime, setLastGameTime] = useState(0);
  const [playerName, setPlayerName] = useState("");
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("http://localhost:3200/leaderboard");
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Fout bij ophalen leaderboard:", error);
    }
  };

  const saveScore = async (name, time) => {
    try {
      await fetch("http://localhost:3200/leaderboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, time }),
      });
      fetchLeaderboard(); // Haal het leaderboard op na het opslaan van de score
    } catch (error) {
      console.error("Fout bij opslaan score:", error);
    }
  };

  useEffect(() => {
    fetchLeaderboard(); // Haal de leaderboard op bij het laden van de app
  }, []);

  const handleStart = (name) => {
    setPlayerName(name);
    setGameStarted(true);
    setGameTime(0);
    startCountdown();
  };

  const startCountdown = () => {
    setCanMove(false);
    setCountdown(3);

    let timeLeft = 3;
    const countdownInterval = setInterval(() => {
      if (timeLeft > 0) {
        setCountdown(timeLeft);
        timeLeft -= 1;
      } else {
        clearInterval(countdownInterval);
        setCanMove(true);
      }
    }, 1000);
  };

  const handleFinishReached = () => {
    setLastGameTime(gameTime);
    saveScore(playerName, gameTime); // Sla de score op in de API
    setGameStarted(false);
    setCanMove(false);
  };

  useEffect(() => {
    let gameInterval;
    if (canMove) {
      gameInterval = setInterval(() => {
        setGameTime((prevTime) => prevTime + 1);
      }, 1000);
    }

    return () => clearInterval(gameInterval);
  }, [canMove]);

  return (
    <>
      {!gameStarted && (
        <StartScreen
          onStart={handleStart}
          lastGameTime={lastGameTime}
          playerName={playerName}
          leaderboard={leaderboard} // Geef het leaderboard door
        />
      )}
      {gameStarted && (
        <>
          <KeyboardControls map={keyboardMap}>
            <Canvas
              shadows
              camera={{ position: [3, 3, 3], near: 0.1, fov: 40 }}
              style={{
                touchAction: "none",
              }}
            >
              <color attach="background" args={["#ececec"]} />
              <Experience
                canMove={canMove}
                startCountdown={startCountdown}
                onFinishReached={handleFinishReached}
              />
            </Canvas>
          </KeyboardControls>

          <div
            style={{
              position: "absolute",
              top: 20,
              left: 20,
              color: "black",
              fontSize: "24px",
            }}
          >
            {canMove
              ? `${playerName}, time: ${gameTime}s`
              : countdown > 0
              ? `Start in: ${countdown}s`
              : "Starten..."}
          </div>
        </>
      )}
    </>
  );
}

export default App;
