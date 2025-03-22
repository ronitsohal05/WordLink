import React from "react";
import { useEffect, useState } from "react";


function WordGame() {
  const [dailyWordPair, setDailyWordPair] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [guesses, setGuesses] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/daily-pair')
      .then(res => res.json())
      .then(data => {
        setDailyWordPair(data);
        setCurrentWord(data[0]);
        setGuesses([data[0]]);
        console.log(data);
      })
  }, []);


  return (
    <div>
      <h1>Word Game</h1>

      {/*Guess List*/}
      <div>
        <ul>
          <li>Guess 1</li>
          <li>Guess 2</li>
          <li>Guess 3</li>
        </ul>
      </div>

      {/*Input Buttons*/}
      <div>
        <input
          type="text"
        />
        <button>Enter</button>
        <button>Restart</button>
      </div>

    </div>
  );
};

export default WordGame;
