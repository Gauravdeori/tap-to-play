import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion } from 'framer-motion';

const COLORS = [
  { name: 'Red', hsl: 'hsl(0, 72%, 55%)' },
  { name: 'Blue', hsl: 'hsl(220, 80%, 55%)' },
  { name: 'Green', hsl: 'hsl(152, 60%, 45%)' },
  { name: 'Yellow', hsl: 'hsl(48, 92%, 55%)' },
  { name: 'Purple', hsl: 'hsl(262, 83%, 62%)' },
  { name: 'Orange', hsl: 'hsl(28, 85%, 55%)' },
];

const ColorMatch = () => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [wordColor, setWordColor] = useState(COLORS[0]);
  const [displayWord, setDisplayWord] = useState(COLORS[0]);
  const [isMatch, setIsMatch] = useState(true);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const generateRound = useCallback(() => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const match = Math.random() > 0.5;
    setDisplayWord(word);
    setWordColor(match ? word : color.name === word.name ? COLORS[(COLORS.indexOf(color) + 1) % COLORS.length] : color);
    setIsMatch(match ? true : word.name === color.name);
  }, []);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setGameActive(true);
    setGameOver(false);
    setFeedback(null);
    generateRound();
    sounds.click();
  };

  const answer = (userSaysMatch: boolean) => {
    if (!gameActive) return;
    const correct = userSaysMatch === isMatch;
    if (correct) {
      setScore(s => s + 1);
      sounds.match();
      setFeedback('correct');
    } else {
      setLives(l => {
        if (l <= 1) {
          setGameActive(false);
          setGameOver(true);
          saveScore('color-match', score);
          sounds.gameOver();
          return 0;
        }
        return l - 1;
      });
      sounds.lose();
      setFeedback('wrong');
    }
    setTimeout(() => {
      setFeedback(null);
      if (!(lives <= 1 && !correct)) generateRound();
    }, 400);
  };

  const restart = () => {
    setGameActive(false);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setFeedback(null);
  };

  return (
    <GameLayout title="Color Match" gameId="color-match" onRestart={restart} score={score}>
      <div className="w-full max-w-sm mx-auto text-center">
        {!gameActive && !gameOver && (
          <div>
            <p className="text-muted-foreground mb-4">Does the <strong>word</strong> match the <strong>text color</strong>?</p>
            <button onClick={startGame} className="btn-game text-lg">Start!</button>
          </div>
        )}
        {gameActive && (
          <div>
            <div className="flex justify-center gap-1 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="text-xl">{i < lives ? '❤️' : '🖤'}</span>
              ))}
            </div>
            <motion.div
              key={displayWord.name + wordColor.hsl}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-5xl font-display font-extrabold mb-8 py-8 rounded-2xl border border-border bg-card ${feedback === 'correct' ? 'ring-2 ring-green-500' : feedback === 'wrong' ? 'ring-2 ring-destructive' : ''}`}
              style={{ color: wordColor.hsl }}
            >
              {displayWord.name}
            </motion.div>
            <div className="flex gap-4 justify-center">
              <button onClick={() => answer(true)} className="btn-game flex-1 max-w-[140px]">Match ✓</button>
              <button onClick={() => answer(false)} className="btn-game-secondary flex-1 max-w-[140px]">No Match ✗</button>
            </div>
          </div>
        )}
        {gameOver && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="text-2xl font-display font-bold text-foreground mb-2">Game Over!</p>
            <p className="text-muted-foreground mb-4">Score: <span className="text-accent font-bold">{score}</span></p>
            <button onClick={startGame} className="btn-game">Play Again</button>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
};

export default ColorMatch;
