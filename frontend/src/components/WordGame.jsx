function WordGame() {
  

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
