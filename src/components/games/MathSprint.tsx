import { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion } from 'framer-motion';

interface Problem {
  question: string;
  answer: number;
  options: number[];
}

const generateProblem = (difficulty: number): Problem => {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * Math.min(ops.length, 1 + Math.floor(difficulty / 5)))];
  let a: number, b: number, answer: number;

  const max = 10 + difficulty * 3;
  if (op === '+') {
    a = Math.floor(Math.random() * max) + 1;
    b = Math.floor(Math.random() * max) + 1;
    answer = a + b;
  } else if (op === '-') {
    a = Math.floor(Math.random() * max) + 2;
    b = Math.floor(Math.random() * a) + 1;
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 12) + 2;
    b = Math.floor(Math.random() * 12) + 2;
    answer = a * b;
  }

  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 10) - 5;
    const wrong = answer + (offset === 0 ? 1 : offset);
    if (wrong >= 0) options.add(wrong);
  }

  return {
    question: `${a} ${op} ${b}`,
    answer,
    options: Array.from(options).sort(() => Math.random() - 0.5),
  };
};

const GAME_DURATION = 30;

const MathSprint = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_DURATION);
    setGameActive(true);
    setGameOver(false);
    setFeedback(null);
    setProblem(generateProblem(0));
    sounds.click();
  };

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          setGameOver(true);
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  useEffect(() => {
    if (gameOver && score > 0) {
      saveScore('math-sprint', score);
      sounds.gameOver();
    }
  }, [gameOver, score]);

  const selectAnswer = (val: number) => {
    if (!gameActive || !problem) return;
    if (val === problem.answer) {
      const bonus = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
      setScore(s => s + bonus);
      setStreak(s => s + 1);
      setFeedback('correct');
      sounds.match();
    } else {
      setStreak(0);
      setFeedback('wrong');
      sounds.lose();
    }
    setTimeout(() => {
      setFeedback(null);
      setProblem(generateProblem(score));
    }, 300);
  };

  const restart = () => {
    setGameActive(false);
    setGameOver(false);
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_DURATION);
    setProblem(null);
    setFeedback(null);
  };

  return (
    <GameLayout title="Math Sprint" gameId="math-sprint" onRestart={restart} score={score}>
      <div className="w-full max-w-sm mx-auto text-center">
        {!gameActive && !gameOver && (
          <div>
            <p className="text-muted-foreground mb-4">Solve math problems as fast as you can!</p>
            <button onClick={startGame} className="btn-game text-lg">Start!</button>
          </div>
        )}
        {gameActive && problem && (
          <div>
            <div className="flex justify-between mb-4 text-sm text-muted-foreground">
              <span>Time: <span className="text-foreground font-bold">{timeLeft}s</span></span>
              <span>Streak: <span className="text-foreground font-bold">🔥 {streak}</span></span>
            </div>
            <motion.div
              key={problem.question}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-4xl font-display font-extrabold text-foreground mb-6 py-8 bg-card rounded-2xl border border-border
                ${feedback === 'correct' ? 'ring-2 ring-green-500' : feedback === 'wrong' ? 'ring-2 ring-destructive' : ''}`}
            >
              {problem.question} = ?
            </motion.div>
            <div className="grid grid-cols-2 gap-3">
              {problem.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => selectAnswer(opt)}
                  className="btn-game-secondary text-xl font-bold py-4"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}
        {gameOver && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="text-2xl font-display font-bold text-foreground mb-2">Time's Up!</p>
            <p className="text-muted-foreground mb-4">Score: <span className="text-accent font-bold">{score}</span></p>
            <button onClick={startGame} className="btn-game">Play Again</button>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
};

export default MathSprint;
