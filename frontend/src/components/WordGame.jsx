import React from "react";
import { useEffect, useState } from "react";


function WordGame() {
  const [dailyWordPair, setDailyWordPair] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [inputValue, setInputValue] = useState("");

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

  function handleEnterGuess(){
    if(inputValue.trim() !== "") {
      setGuesses(prevGuesses => [...prevGuesses, inputValue]);
      setInputValue("");
    }
  }

  function handleRestart(){
    setCurrentWord(dailyWordPair[0]);
    setGuesses([dailyWordPair[0]]);
    setInputValue("");
  }


  return (
    <div>
      <h1>Word Game</h1>

      {/*Guess List*/}
      <div>
        <ul>
          {guesses.map((guess, index) => (
            <li key={index}>{guess}</li>
          ))}
        </ul>
      </div>

      {/*Input Buttons*/}
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={handleEnterGuess}>Enter</button>
        <button onClick={handleRestart}>Restart</button>
      </div>

    </div>
  );
};

export default WordGame;
