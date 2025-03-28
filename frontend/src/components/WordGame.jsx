import React from "react";
import { useEffect, useState } from "react";


function WordGame() {
  const [dailyWordPair, setDailyWordPair] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [guesses, setGuesses] = useState([]);
  const [inputValue, setInputValue] = useState(""); 
  const [gameOver, setGameOver] = useState(false);

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

      fetch('http://127.0.0.1:5000/api/validate-guess',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({guess: inputValue, current_word: currentWord})
      })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          if (data.valid) {
            fetch('http://127.0.0.1:5000/api/check-final-guess',{
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({guess: inputValue, final_word: dailyWordPair[1]})
            })
            .then(res => res.json())
            .then(data => {
              setGuesses(prevGuesses => [...prevGuesses, inputValue]);
              setCurrentWord(inputValue);
              if (data.end) {
                setGameOver(true);
              }
            });
            
          } else{
            console.log(data.error);
          }
        });

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
      {!gameOver && 
        <div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button onClick={handleEnterGuess}>Enter</button>
          <button onClick={handleRestart}>Restart</button>
        </div>
      }
      {gameOver && 
        <div>
          <h1>Congratulations, you solved todays Word Link Puzzle!</h1>
        </div>
      }
      

    </div>
  );
};

export default WordGame;
