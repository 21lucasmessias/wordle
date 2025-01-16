import { useCallback, useEffect, useState } from "react";
import "./App.css";

const SOLUTION = "teste";
const WORD_SIZE = 5;
const TRIES = 6;

type Guess = {
  key: string;
  value: string | null;
};

type CurrentGuess = {
  value: string;
  number: number;
};

const factoryGuess = (currentGuess: CurrentGuess): Guess => {
  return {
    key: crypto.randomUUID(),
    value: currentGuess.value,
  };
};

const factoryCurrentGuess = (value: string, number: number): CurrentGuess => {
  return {
    value,
    number,
  };
};

const isAChar = (symbol: string) => symbol.match(/^[a-z]$/);
const isBackspace = (symbol: string) => symbol === "Backspace";
const isEnter = (symbol: string) => symbol === "Enter";

const isAValidTry = (currentGuess: CurrentGuess, guesses: Guess[]) =>
  currentGuess.value.length === WORD_SIZE &&
  currentGuess.number + 1 !== TRIES &&
  !guesses.some((guess) => guess.value === currentGuess.value);

const checkWinner = (currentGuess: CurrentGuess) =>
  currentGuess.value.toLowerCase() === SOLUTION;

function App() {
  const [guesses, setGuesses] = useState<Array<Guess>>([]);
  const [currentGuess, setCurrentGuess] = useState<CurrentGuess>(
    factoryCurrentGuess("", 0)
  );
  const handleCharPress = useCallback((char: string) => {
    setCurrentGuess((oldGuess) => {
      if (oldGuess.value.length === WORD_SIZE) return oldGuess;

      return {
        ...oldGuess,
        value: oldGuess.value + char,
      };
    });
  }, []);

  const handleBackspacePress = useCallback(() => {
    setCurrentGuess((oldGuess) => {
      if (oldGuess.value.length === 0) return oldGuess;

      return {
        ...oldGuess,
        value: oldGuess.value.slice(0, -1),
      };
    });
  }, []);

  const handleEnterPress = useCallback(() => {
    if (isAValidTry(currentGuess, guesses)) {
      const newGuesses = [...guesses];
      newGuesses[currentGuess.number] = factoryGuess(currentGuess);

      setGuesses(newGuesses);

      if (checkWinner(currentGuess)) {
        return;
      }

      setCurrentGuess(factoryCurrentGuess("", currentGuess.number + 1));
    }
  }, [currentGuess, guesses]);

  const handleKeyboard = useCallback(
    (e: KeyboardEvent) => {
      const { key } = e;

      if (isAChar(key)) {
        handleCharPress(key);
      }

      if (isBackspace(key)) {
        handleBackspacePress();
      }

      if (isEnter(key)) {
        handleEnterPress();
      }
    },
    [handleCharPress, handleBackspacePress, handleEnterPress]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);

    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleKeyboard]);

  const handleRestartGame = () => {
    const newGuesses: Guess[] = [];

    for (let i = 0; i < TRIES; i++) {
      newGuesses.push({
        key: crypto.randomUUID(),
        value: null,
      });
    }

    setGuesses(newGuesses);

    setCurrentGuess(factoryCurrentGuess("", 0))
  }

  useEffect(() => {
    handleRestartGame()
  }, []);

  return (
    <div className="board">
      <p>{JSON.stringify(currentGuess)}</p>
      <p>{SOLUTION}</p>
      {guesses.map((guess, index) => {
        if (guess.value) {
          return <FinalRow key={guess.key} guess={guess.value!} />;
        }

        if(currentGuess.number === index) {
          return <Row key={guess.key} guess={currentGuess.value} />;
        }

        return <Row key={guess.key} guess={guess.value} />;
      })}

      <button onClick={handleRestartGame}>restart</button>
    </div>
  );
}

interface IFinalRowProps {
  guess: string;
}

function FinalRow({ guess }: IFinalRowProps) {
  return (
    <div className="row">
      {guess.split("").map((character, i) => {
        let className = "cell";
        if (SOLUTION[i] === guess[i]) {
          className += " correct";
        } else if (SOLUTION.includes(guess[i])) {
          className += " almost";
        } else {
          className += " wrong";
        }
        return <Cell key={i} character={character} className={className} />;
      })}
    </div>
  );
}

interface IRowProps {
  guess: string | null;
}

function Row({ guess }: IRowProps) {
  const cells = [];

  for (let i = 0; i < WORD_SIZE; i++) {
    cells.push(<Cell key={i} character={guess?.[i] || ""} className="cell" />);
  }

  return <div className="row">{cells}</div>;
}

interface ICellProps {
  character: string;
  className: string;
}

function Cell({ character, className }: ICellProps) {
  return <div className={className}>{character}</div>;
}

export default App;
