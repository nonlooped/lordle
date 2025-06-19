"use client";
import { getWordsList } from "@/server/words";
import { useCallback, useEffect, useState } from "react";
import { FaChartBar, FaCog, FaInfoCircle } from "react-icons/fa";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

type LetterStatus = "correct" | "present" | "absent";
type GameState = "playing" | "won" | "lost";

interface HomeClientProps {
  solution: string;
}

export default function HomeClient({ solution }: HomeClientProps) {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [statusGrid, setStatusGrid] = useState<LetterStatus[][]>([]);
  const [keyboardStatus, setKeyboardStatus] = useState<
    Record<string, LetterStatus>
  >({});
  const [wordsList, setWordsList] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState>("playing");

  useEffect(() => {
    void getWordsList().then(setWordsList);
  }, []);

  const updateKeyboardStatus = useCallback(
    (guess: string, statuses: LetterStatus[]) => {
      const newKeyboardStatus = { ...keyboardStatus };

      guess.split("").forEach((letter, index) => {
        const currentStatus = newKeyboardStatus[letter];
        const newStatus = statuses[index];

        if (
          !currentStatus ||
          newStatus === "correct" ||
          (newStatus === "present" && currentStatus === "absent")
        ) {
          newKeyboardStatus[letter] = newStatus!;
        }
      });

      setKeyboardStatus(newKeyboardStatus);
    },
    [keyboardStatus],
  );

  const submitGuess = useCallback(() => {
    const status = getLetterStatuses(currentGuess, solution);
    const newGuesses = [...guesses, currentGuess];
    const newStatusGrid = [...statusGrid, status];

    setGuesses(newGuesses);
    setStatusGrid(newStatusGrid);
    updateKeyboardStatus(currentGuess, status);
    setCurrentGuess("");

    if (currentGuess === solution) {
      setGameState("won");
      localStorage.setItem(
        "lordle-wins",
        (parseInt(localStorage.getItem("lordle-wins") ?? "0") + 1).toString(),
      );
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameState("lost");
      localStorage.setItem(
        "lordle-losses",
        (parseInt(localStorage.getItem("lordle-losses") ?? "0") + 1).toString(),
      );
    }
  }, [currentGuess, guesses, solution, statusGrid, updateKeyboardStatus]);

  const handleKeyInput = useCallback(
    (key: string) => {
      if (gameState !== "playing") return;

      if (/^[a-z]$/.test(key)) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess((prev) => prev + key);
        }
      } else if (key === "backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key === "enter") {
        if (currentGuess.length === WORD_LENGTH) {
          if (!wordsList.includes(currentGuess)) {
            toast("Invalid word", {
              description: "Please enter a valid 5-letter word.",
            });
            return;
          }
          submitGuess();
        }
      }
    },
    [currentGuess, gameState, submitGuess, wordsList],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyInput(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyInput]);

  const getKeyboardButtonColor = (key: string): string => {
    const status = keyboardStatus[key.toLowerCase()];

    switch (status) {
      case "correct":
        return "bg-green-500";
      case "present":
        return "bg-yellow-500";
      case "absent":
        return "bg-slate-500";
      default:
        return "bg-gray-700 hover:bg-gray-600";
    }
  };

  const getCellBackground = (status: LetterStatus | undefined): string => {
    switch (status) {
      case "correct":
        return "bg-green-500";
      case "present":
        return "bg-yellow-500";
      case "absent":
        return "bg-slate-500";
      default:
        return "bg-transparent";
    }
  };

  const keyboardRows = [
    "QWERTYUIOP".split(""),
    "ASDFGHJKL".split(""),
    ["ENTER", ..."ZXCVBNM".split(""), "⌫"],
  ];

  return (
    <div className="mt-2 flex flex-1 flex-col items-center justify-between">
      {/* End Screen */}
      <Dialog open={gameState === "won" || gameState === "lost"}>
        <DialogContent>
          <DialogTitle>
            {gameState === "won" ? "Congratulations!" : "Game Over"}
          </DialogTitle>
          <DialogDescription>
            {gameState === "won"
              ? "You guessed the word!"
              : `The word was: ${solution.toUpperCase()}`}
          </DialogDescription>
          <div className="mt-4 flex justify-center gap-2">
            <button
              className="rounded-md bg-blue-500 px-4 py-2 text-white"
              onClick={() => {
                window.location.reload();
              }}
            >
              Play Again
            </button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex w-full max-w-lg items-center justify-between px-3 text-2xl text-slate-500">
        <Dialog>
          <DialogTrigger>
            <FaInfoCircle />
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>How to Play</DialogTitle>
            <DialogDescription>
              Guess the LORDLE in 6 tries.
              <br />
              Each guess must be a valid 5-letter word. Hit the enter button to
              submit.
              <br />
            </DialogDescription>
            <p className="font-bold">Examples</p>
            <div className="flex items-center gap-2">
              {"1."}
              {"CR".split("").map((l) => (
                <div
                  key={l}
                  className={`flex h-16 w-16 items-center justify-center border-2 border-slate-700 bg-green-500 text-center text-3xl font-bold text-white uppercase`}
                >
                  {l}
                </div>
              ))}
              <div
                className={`flex h-16 w-16 items-center justify-center border-2 border-slate-700 bg-yellow-500 text-center text-3xl font-bold text-white uppercase`}
              >
                A
              </div>
              {"NE".split("").map((l) => (
                <div
                  key={l}
                  className={`flex h-16 w-16 items-center justify-center border-2 border-slate-700 bg-slate-500 text-center text-3xl font-bold text-white uppercase`}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="text-muted-foreground ml-5 flex flex-col text-sm">
              <p>
                The letters C and R are in the word and in the correct spots.
              </p>
              <p>The letter A is in the word, but is incorrectly placed.</p>
            </div>
          </DialogContent>
        </Dialog>
        <h1 className="text-primary font-bold uppercase">Infinite Lordle</h1>
        <div className="flex gap-x-2">
          <FaChartBar />
          <FaCog />
        </div>
      </div>

      {/* Game Grid */}
      <div className="flex flex-col items-center gap-2">
        {Array.from({ length: MAX_GUESSES }).map((_, rowIdx) => {
          const guess =
            guesses[rowIdx] ?? (rowIdx === guesses.length ? currentGuess : "");
          const isSubmitted = rowIdx < guesses.length;
          const statusRow = statusGrid[rowIdx];

          return (
            <div key={rowIdx} className="flex gap-2">
              {Array.from({ length: WORD_LENGTH }).map((_, colIdx) => {
                const char = guess[colIdx] ?? "";
                const status = isSubmitted ? statusRow?.[colIdx] : undefined;
                const bgClass = getCellBackground(status);

                return (
                  <div
                    key={colIdx}
                    className={`h-16 w-16 border-2 border-slate-700 text-center text-3xl font-bold text-white uppercase ${bgClass} flex items-center justify-center`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Keyboard */}
      <div className="mb-5 max-w-sm px-2 md:max-w-md lg:max-w-lg">
        {keyboardRows.map((row, rowIndex) => (
          <div key={rowIndex} className="mt-2 flex justify-center gap-1">
            {row.map((key) => {
              const isSpecialKey = key === "ENTER" || key === "⌫";
              const keyWidth = isSpecialKey ? "w-16" : "w-12";
              const bgColor = getKeyboardButtonColor(key);

              return (
                <button
                  key={key}
                  className={`h-12 ${keyWidth} rounded-md font-bold text-white uppercase ${bgColor} flex items-center justify-center`}
                  onClick={() => {
                    if (key === "ENTER") {
                      handleKeyInput("enter");
                    } else if (key === "⌫") {
                      handleKeyInput("backspace");
                    } else {
                      handleKeyInput(key.toLowerCase());
                    }
                  }}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function getLetterStatuses(guess: string, solution: string): LetterStatus[] {
  const result = Array<LetterStatus>(WORD_LENGTH).fill("absent");
  const solutionLetters = solution.split("");

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guess[i] === solution[i]) {
      result[i] = "correct";
      solutionLetters[i] = "_"; // Mark as used ig
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] !== "correct" && solutionLetters.includes(guess[i]!)) {
      result[i] = "present";
      solutionLetters[solutionLetters.indexOf(guess[i]!)] = "_"; // Mark as used ig
    }
  }

  return result;
}
