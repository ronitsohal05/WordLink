import { useEffect, useState, useRef } from "react";
import { ArrowLeft } from "lucide-react";

export default function WordGame() {
  const [dailyWordPair, setDailyWordPair] = useState([]);
  const [currentWord, setCurrentWord] = useState("");
  const [guesses, setGuesses] = useState([]); // Now each guess: { word: string, pathCount: number }
  const [inputValue, setInputValue] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [error, setError] = useState("");
  const [showInstructions, setShowInstructions] = useState(true);
  const [viewingGuesses, setViewingGuesses] = useState(false);
  const ladderRef = useRef(null);

  useEffect(() => {
    fetch("https://wordlink-8bha.onrender.com/api/daily-pair")
      .then((res) => res.json())
      .then((data) => {
        setDailyWordPair(data);
        setCurrentWord(data[0]);
        setGuesses([{ word: data[0], pathCount: null }]);
      })
      .catch(() => {
        const testPair = ["start", "final"];
        setDailyWordPair(testPair);
        setCurrentWord(testPair[0]);
        setGuesses([{ word: testPair[0], pathCount: null }]);
      });
  }, []);

  useEffect(() => {
    if (ladderRef.current && guesses.length > 0) {
      const scrollHeight = ladderRef.current.scrollHeight;
      ladderRef.current.scrollTop = scrollHeight;
    }
  }, [guesses]);

  function getColorByPathCount(count) {
    if (count == null) return "#374151"; // gray
    if (count === 0) return "#4B5563"; // dark gray
    if (count <= 2) return "#DC2626"; // red
    if (count <= 5) return "#F59E0B"; // orange
    if (count <= 10) return "#FACC15"; // yellow
    if (count <= 20) return "#4ADE80"; // light green
    return "#60A5FA"; // blue
  }

  function handleEnterGuess() {
    if (inputValue.trim() === "") return;
    if (inputValue.length !== 5) {
      setError("Please enter a 5-letter word");
      return;
    }
    setError("");

    fetch("https://wordlink-8bha.onrender.com/api/validate-guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guess: inputValue, current_word: currentWord }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          fetch("https://wordlink-8bha.onrender.com/api/check-final-guess", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guess: inputValue, final_word: dailyWordPair[1] }),
          })
            .then((res) => res.json())
            .then((finalData) => {
              fetch("https://wordlink-8bha.onrender.com/api/path-count", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ word: inputValue, final_word: dailyWordPair[1] }),
              })
                .then((res) => res.json())
                .then((pathData) => {
                  setGuesses((prev) => [...prev, { word: inputValue, pathCount: pathData.count }]);
                  setCurrentWord(inputValue);
                  if (finalData.end) setGameOver(true);
                })
                .catch(() => {
                  setGuesses((prev) => [...prev, { word: inputValue, pathCount: null }]);
                  setCurrentWord(inputValue);
                });
            });
        } else {
          setError(data.error || "Invalid word");
        }
      })
      .catch(() => setError("Error validating your guess"));

    setInputValue("");
  }

  function handleRestart() {
    setCurrentWord(dailyWordPair[0]);
    setGuesses([{ word: dailyWordPair[0], pathCount: null }]);
    setInputValue("");
    setGameOver(false);
    setError("");
    setViewingGuesses(false);
  }

  function handleUndo() {
    if (guesses.length > 1) {
      const newGuesses = [...guesses];
      newGuesses.pop();
      setGuesses(newGuesses);
      setCurrentWord(newGuesses[newGuesses.length - 1].word);
      setGameOver(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleEnterGuess();
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 text-gray-200">
      
      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-md mx-4 text-left border border-gray-700">
            <h2 className="text-2xl font-bold text-cyan-400 text-center">How to Play</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-300 leading-relaxed">
              <p>Your goal is to transform the <span className="font-semibold text-white">start word</span> into the <span className="font-semibold text-white">goal word</span>.</p>
              <ul className="list-disc list-inside space-y-1 pl-1">
                <li>Change <span className="font-semibold text-white">only one letter</span> at a time.</li>
                <li>Each guess must be a <span className="font-semibold text-white">valid 5-letter English word</span>.</li>
                <li>No rearranging letters — only change them.</li>
                <li>New challenge available <span className="font-semibold text-white">every day</span>.</li>
              </ul>
              <p className="text-gray-400">
                <span className="text-cyan-300 font-medium">Example:</span> START → STARK → STACK → SLACK → BLACK
              </p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-6 w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Word Ladder */}
      <div className="relative w-full max-w-md flex-1 flex flex-col items-center">
        <div className="absolute h-full w-0.5 bg-gray-700 z-0"></div>
        <div
          ref={ladderRef}
          className="absolute inset-0 overflow-y-auto flex flex-col items-center"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="h-[40vh]"></div>
          {guesses.map((guessObj, index) => {
            const { word, pathCount } = guessObj;
            const bgColor = index === guesses.length - 1 ? "#0891b2" : getColorByPathCount(pathCount);

            return (
              <div key={index} className="flex flex-col items-center mb-8 z-10">
                <div
                  className="relative w-48 h-16 flex items-center justify-center rounded-xl shadow-lg transition-all duration-300"
                  style={{ backgroundColor: bgColor }}
                >
                  <div className="text-2xl tracking-wider text-white">{word.toUpperCase()}</div>
                  {index < guesses.length - 1 && (
                    <div className="absolute -bottom-4 w-2 h-2 rounded-full bg-gray-500 z-20"></div>
                  )}
                </div>
              </div>
            );
          })}
          <div className="h-[40vh]"></div>
        </div>
      </div>

      {/* Input + Controls */}
      <div className="w-full max-w-md bg-gray-800 shadow-lg rounded-t-xl overflow-hidden border-t border-gray-700 mt-4">
        <div className="bg-gray-850 p-3 text-center border-b border-gray-700">
          <span className="text-gray-400">Change one letter from: </span>
          <span className="font-bold text-gray-200">{currentWord.toUpperCase()}</span>
        </div>
        {error && (
          <div className="bg-red-900/30 px-4 py-2 text-sm text-red-300 border-b border-red-900/50">{error}</div>
        )}
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
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              Enter
            </button>
          </div>
          <div className="flex justify-between mt-3">
            <button
              onClick={handleUndo}
              disabled={guesses.length <= 1}
              className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-40 transition-colors"
            >
              <ArrowLeft size={16} />
              Undo
            </button>
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 text-sm border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
            >
              Restart
            </button>
          </div>
        </div>
      </div>

      {/* Game Over */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg max-w-md mx-4 text-center border border-gray-700">
            <h2 className="text-2xl font-bold text-emerald-400">Congratulations!</h2>
            <p className="mt-2 text-gray-300">
              You connected {guesses[0].word} to {guesses[guesses.length - 1].word} in {guesses.length - 1} steps.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                onClick={handleRestart}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
