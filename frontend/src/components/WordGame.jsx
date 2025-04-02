import { useEffect, useState, useRef } from "react"
import { ArrowLeft } from "lucide-react"

export default function WordGame() {
  const [dailyWordPair, setDailyWordPair] = useState([])
  const [currentWord, setCurrentWord] = useState("")
  const [guesses, setGuesses] = useState([])
  const [inputValue, setInputValue] = useState("")
  const [gameOver, setGameOver] = useState(false)
  const [error, setError] = useState("")
  const ladderRef = useRef(null)

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/daily-pair")
      .then((res) => res.json())
      .then((data) => {
        setDailyWordPair(data)
        setCurrentWord(data[0])
        setGuesses([data[0]])
      })
      .catch(() => {
        const testPair = ["start", "final"]
        setDailyWordPair(testPair)
        setCurrentWord(testPair[0])
        setGuesses([testPair[0]])
      })
  }, [])

  // Scroll to the latest word whenever guesses change
  useEffect(() => {
    if (ladderRef.current && guesses.length > 0) {
      const scrollHeight = ladderRef.current.scrollHeight
      ladderRef.current.scrollTop = scrollHeight
    }
  }, [guesses])

  function handleEnterGuess() {
    if (inputValue.trim() === "") return

    if (inputValue.length !== 5) {
      setError("Please enter a 5-letter word")
      return
    }

    setError("")

    fetch("http://127.0.0.1:5000/api/validate-guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess: inputValue, current_word: currentWord }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          fetch("http://127.0.0.1:5000/api/check-final-guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guess: inputValue, final_word: dailyWordPair[1] }),
          })
            .then((res) => res.json())
            .then((data) => {
              setGuesses((prev) => [...prev, inputValue])
              setCurrentWord(inputValue)
              if (data.end) setGameOver(true)
            })
        } else {
          setError(data.error || "Invalid word")
        }
      })
      .catch(() => setError("Error validating your guess"))

    setInputValue("")
  }

  function handleRestart() {
    setCurrentWord(dailyWordPair[0])
    setGuesses([dailyWordPair[0]])
    setInputValue("")
    setGameOver(false)
    setError("")
  }

  function handleUndo() {
    if (guesses.length > 1) {
      const newGuesses = [...guesses]
      newGuesses.pop()
      setGuesses(newGuesses)
      setCurrentWord(newGuesses[newGuesses.length - 1])
      setGameOver(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleEnterGuess()
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-200">
      {/* Integrated Header */}
      <div className="w-full max-w-md text-center pt-6 pb-2">
        <h1 className="text-3xl font-bold text-gray-100">Word <span className="text-3xl font-bold text-cyan-600">Link</span></h1>
        <p className="text-gray-400 mt-1">Change one letter at a time to get from the first word to the last word.</p>
      </div>

      {/* Game Status Bar */}
      <div className="w-full max-w-md flex justify-between items-center px-4 py-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Start:</span>
          <span className="font-medium text-gray-300">{dailyWordPair[0]?.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Goal:</span>
          <span className="font-medium text-gray-300">{dailyWordPair[1]?.toUpperCase()}</span>
        </div>
      </div>

      {/* Ladder Container - Takes most of the screen */}
      <div className="relative w-full max-w-md flex-1 flex flex-col items-center">
        {/* Central vertical line */}
        <div className="absolute h-full w-0.5 bg-gray-700 z-0"></div>

        {/* Scrollable Ladder */}
        <div
          ref={ladderRef}
          className="absolute inset-0 overflow-y-auto flex flex-col items-center"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Spacer to push content down */}
          <div className="h-[40vh]"></div>

          {/* Word Ladder */}
          {guesses.map((guess, index) => (
            <div key={index} className="flex flex-col items-center mb-8 z-10">
              <div
                className={`relative w-48 h-16 flex items-center justify-center rounded-xl shadow-lg transition-all duration-300 ${
                  index === guesses.length - 1
                    ? "bg-cyan-600 text-white font-bold"
                    : "bg-gray-800 text-gray-200 border border-gray-700"
                }`}
              >
                <div className="text-2xl tracking-wider">{guess.toUpperCase()}</div>

                {/* Connection dot */}
                {index < guesses.length - 1 && (
                  <div className="absolute -bottom-4 w-2 h-2 rounded-full bg-gray-500 z-20"></div>
                )}
              </div>
            </div>
          ))}

          {/* Spacer to push content up */}
          <div className="h-[40vh]"></div>
        </div>
      </div>

      {/* Game Over Message - Overlay */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-md mx-4 text-center border border-gray-700">
            <h2 className="text-2xl font-bold text-emerald-400">Congratulations!</h2>
            <p className="mt-2 text-gray-300">
              You connected {guesses[0]} to {guesses[guesses.length - 1]} in {guesses.length - 1} steps.
            </p>
            <button
              onClick={handleRestart}
              className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Integrated Input Area */}
      <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-t-xl overflow-hidden border-t border-gray-700">
        {/* Current Word Indicator */}
        <div className="bg-gray-850 bg-opacity-50 p-3 text-center border-b border-gray-700">
          <span className="text-gray-400">Change one letter from: </span>
          <span className="font-bold text-gray-200">{currentWord.toUpperCase()}</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/30 px-4 py-2 text-sm text-red-300 border-b border-red-900/50">{error}</div>
        )}

        {/* Input and Buttons */}
        <div className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.toLowerCase())}
              onKeyDown={handleKeyDown}
              maxLength={5}
              placeholder="Enter a 5-letter word"
              className="flex-1 px-4 py-3 text-center text-lg font-medium bg-gray-700 border border-gray-600 text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
              disabled={gameOver}
            />
            <button
              onClick={handleEnterGuess}
              disabled={gameOver || inputValue.length !== 5}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Enter
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-3">
            <button
              onClick={handleUndo}
              disabled={guesses.length <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft size={16} />
              Undo Last Guess
            </button>

            <button
              onClick={handleRestart}
              className="px-3 py-1.5 text-sm border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
            >
              Restart Game
            </button>
          </div>
        </div>
      </div>

      {/* Hide scrollbars */}
      <style jsx global>{`
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}

