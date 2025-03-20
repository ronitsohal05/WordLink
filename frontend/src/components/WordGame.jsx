import React, { useState, useEffect } from "react";
import GraphVisualization from "./GraphVisualization";

const WordGame = () => {
  const [dailyPair, setDailyPair] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [edges, setEdges] = useState([]);

  useEffect(() => {
    fetch("/api/daily-pair")
      .then((res) => res.json())
      .then((data) => {
        setDailyPair(data);
        setCurrentWord(data[0]);
      });
  }, []);

  const handleGuess = (guess) => {
    fetch("/api/validate-guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess, current_word: currentWord }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setGuesses([...guesses, guess]);
          setEdges([...edges, [currentWord, guess]]);
          setCurrentWord(guess);
        } else {
          alert(data.reason);
        }
      });
  };

  return (
    <div className="h-screen">
      <h1 className="text-2xl font-bold">Word Game</h1>
      <GraphVisualization nodes={[...guesses, ...dailyPair]} edges={edges} />
      <input
        className="border p-2"
        type="text"
        onKeyDown={(e) => e.key === "Enter" && handleGuess(e.target.value)}
      />
    </div>
  );
};

export default WordGame;
