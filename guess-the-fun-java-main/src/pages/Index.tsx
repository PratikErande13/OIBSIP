import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const MAX_ATTEMPTS = 10;
const MIN_NUMBER = 1;
const MAX_NUMBER = 100;
const POINTS_PER_ATTEMPT = 10;

const Index = () => {
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [gameStatus, setGameStatus] = useState<"playing" | "won" | "lost">("playing");
  const [feedback, setFeedback] = useState("Make your first guess!");
  const [guessHistory, setGuessHistory] = useState<number[]>([]);

  useEffect(() => {
    startNewRound();
  }, []);

  const generateRandomNumber = () => {
    return Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;
  };

  const startNewRound = () => {
    setTargetNumber(generateRandomNumber());
    setGuess("");
    setAttempts(0);
    setGameStatus("playing");
    setFeedback(`Round ${round}: Guess a number between ${MIN_NUMBER} and ${MAX_NUMBER}!`);
    setGuessHistory([]);
  };

  const startNewGame = () => {
    setRound(1);
    setTotalScore(0);
    startNewRound();
  };

  const handleGuess = () => {
    const guessNum = parseInt(guess);

    if (isNaN(guessNum) || guessNum < MIN_NUMBER || guessNum > MAX_NUMBER) {
      toast({
        title: "Invalid Input",
        description: `Please enter a number between ${MIN_NUMBER} and ${MAX_NUMBER}`,
        variant: "destructive",
      });
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setGuessHistory([...guessHistory, guessNum]);

    if (guessNum === targetNumber) {
      const points = (MAX_ATTEMPTS - newAttempts + 1) * POINTS_PER_ATTEMPT;
      const newScore = totalScore + points;
      setTotalScore(newScore);
      setGameStatus("won");
      setFeedback(`🎉 Correct! You won ${points} points!`);
      toast({
        title: "Congratulations!",
        description: `You guessed it in ${newAttempts} attempts and earned ${points} points!`,
      });
    } else if (newAttempts >= MAX_ATTEMPTS) {
      setGameStatus("lost");
      setFeedback(`😔 Game Over! The number was ${targetNumber}`);
      toast({
        title: "Game Over",
        description: `You've used all ${MAX_ATTEMPTS} attempts. The number was ${targetNumber}.`,
        variant: "destructive",
      });
    } else {
      const hint = guessNum < targetNumber ? "📈 Higher!" : "📉 Lower!";
      setFeedback(hint);
    }

    setGuess("");
  };

  const handleNextRound = () => {
    setRound(round + 1);
    startNewRound();
  };

  const attemptsRemaining = MAX_ATTEMPTS - attempts;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            🎯 Guess the Number
          </CardTitle>
          <CardDescription className="text-lg">
            Can you guess the number between {MIN_NUMBER} and {MAX_NUMBER}?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score and Round Info */}
          <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Round</p>
              <p className="text-2xl font-bold text-primary">{round}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Score</p>
              <p className="text-2xl font-bold text-secondary">{totalScore}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Attempts Left</p>
              <p className="text-2xl font-bold text-accent">{attemptsRemaining}</p>
            </div>
          </div>

          {/* Feedback */}
          <div className="text-center p-6 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg border-2 border-primary/20">
            <p className="text-2xl font-semibold">{feedback}</p>
          </div>

          {/* Input and Guess Button */}
          {gameStatus === "playing" && (
            <div className="flex gap-2">
              <Input
                type="number"
                min={MIN_NUMBER}
                max={MAX_NUMBER}
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleGuess()}
                placeholder="Enter your guess..."
                className="text-lg"
              />
              <Button onClick={handleGuess} size="lg" className="px-8">
                Guess
              </Button>
            </div>
          )}

          {/* Game Over Actions */}
          {gameStatus !== "playing" && (
            <div className="flex gap-2">
              <Button onClick={handleNextRound} variant="default" size="lg" className="flex-1">
                Next Round
              </Button>
              <Button onClick={startNewGame} variant="secondary" size="lg" className="flex-1">
                New Game
              </Button>
            </div>
          )}

          {/* Guess History */}
          {guessHistory.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">Your Guesses:</p>
              <div className="flex flex-wrap gap-2">
                {guessHistory.map((g, idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      g === targetNumber
                        ? "bg-accent text-accent-foreground"
                        : g < targetNumber
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                    }`}
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Game Rules */}
          <div className="text-xs text-muted-foreground space-y-1 p-4 bg-muted/50 rounded-lg">
            <p className="font-semibold">How to Play:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You have {MAX_ATTEMPTS} attempts per round</li>
              <li>Fewer attempts = More points ({POINTS_PER_ATTEMPT} points per remaining attempt)</li>
              <li>Play multiple rounds to increase your total score</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
