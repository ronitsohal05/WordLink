import React, { useEffect, useState } from "react"
// If you have lucide-react installed, uncomment this:
// import { RefreshCw } from 'lucide-react';

export default function WordGame() {
  const [dailyWordPair, setDailyWordPair] = useState([])
  const [currentWord, setCurrentWord] = useState("")
  const [guesses, setGuesses] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [gameOver, setGameOver] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/daily-pair")
      .then((res) => res.json())
      .then((data) => {
        setDailyWordPair(data)
        setCurrentWord(data[0])
        setGuesses([data[0]])
        console.log(data)
      })
      .catch((err) => {
        console.error("Failed to fetch daily word pair:", err)
        // Fallback for testing if API is not available
        const testPair = ["start", "final"]
        setDailyWordPair(testPair)
        setCurrentWord(testPair[0])
        setGuesses([testPair[0]])
      })
  }, [])

  function handleEnterGuess() {
    if (inputValue.trim() === "") return

    // Validate 5 letters
    if (inputValue.length !== 5) {
      setError("Please enter a 5-letter word")
      return
    }

    setError("")

    fetch("http://127.0.0.1:5000/api/validate-guess", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ guess: inputValue, current_word: currentWord }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        if (data.valid) {
          fetch("http://127.0.0.1:5000/api/check-final-guess", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ guess: inputValue, final_word: dailyWordPair[1] }),
          })
            .then((res) => res.json())
            .then((data) => {
              setGuesses((prevGuesses) => [...prevGuesses, inputValue])
              setCurrentWord(inputValue)
              if (data.end) {
                setGameOver(true)
              }
            })
        } else {
          setError(data.error || "Invalid word")
        }
      })
      .catch((err) => {
        console.error("Error validating guess:", err)
        setError("Error validating your guess")
      })

    setInputValue("")
  }

  function handleRestart() {
    setCurrentWord(dailyWordPair[0])
    setGuesses([dailyWordPair[0]])
    setInputValue("")
    setGameOver(false)
    setError("")
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleEnterGuess()
    }
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen p-6 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-6 text-3xl font-bold text-slate-800">Word Link Puzzle</h1>
        <p className="mb-4 text-slate-600">Change one letter at a time to get from the first word to the last word.</p>
      </div>

      {/* Graph visualization of guesses */}
      <div className="flex-1 flex items-center justify-center w-full my-8">
        <div className="relative w-full max-w-md">
          {guesses.map((guess, index) => (
            <React.Fragment key={index}>
              <div
                className={`absolute transform -translate-x-1/2 w-40 h-16 flex items-center justify-center rounded-md shadow-md ${
                  index === guesses.length - 1 ? "bg-blue-500 text-white" : "bg-white"
                }`}
                style={{
                  left: "50%",
                  top: `${index * 80}px`,
                  zIndex: 10,
                }}
              >
                <div className="p-4 text-xl font-bold">{guess.toUpperCase()}</div>
              </div>

              {/* Connection lines between words */}
              {index < guesses.length - 1 && (
                <div
                  className="absolute w-0.5 bg-slate-300"
                  style={{
                    left: "50%",
                    top: `${index * 80 + 64}px`,
                    height: "16px",
                    transform: "translateX(-50%)",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Game over message */}
      {gameOver && (
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-green-600">Congratulations! You solved today's Word Link Puzzle!</h2>
          <p className="mt-2 text-slate-600">
            You connected {guesses[0]} to {guesses[guesses.length - 1]} in {guesses.length - 1} steps.
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="w-full max-w-md mb-8">
        {error && <p className="mb-2 text-sm text-red-500">{error}</p>}

        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.toLowerCase())}
            onKeyDown={handleKeyDown}
            maxLength={5}
            placeholder="Enter a 5-letter word"
            className="flex-1 px-4 py-2 text-center text-lg font-medium border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={gameOver}
          />
          <button
            onClick={handleEnterGuess}
            disabled={gameOver || inputValue.length !== 5}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enter
          </button>
          <button onClick={handleRestart} className="p-2 border rounded-md hover:bg-slate-100">
            {/* If you have lucide-react, use this: <RefreshCw className="w-4 h-4" /> */}
            {/* Otherwise use the text symbol: */}↻
          </button>
        </div>

        <div className="mt-4 text-center text-sm text-slate-500">
          Change one letter from the current word: <strong>{currentWord.toUpperCase()}</strong>
        </div>
      </div>
    </div>
  )
}

