import { useState, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion } from 'framer-motion';

const NumberGuessing = () => {
  const [maxNum, setMaxNum] = useState(100);
  const [target, setTarget] = useState(() => Math.floor(Math.random() * 100) + 1);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [hint, setHint] = useState<string>('');
  const [won, setWon] = useState(false);
  const [difficulty, setDifficulty] = useState<number | null>(null);

  const restart = useCallback(() => {
    const max = difficulty || 100;
    setTarget(Math.floor(Math.random() * max) + 1);
    setGuess('');
    setAttempts(0);
    setHint('');
    setWon(false);
  }, [difficulty]);

  const startGame = (max: number) => {
    setDifficulty(max);
    setMaxNum(max);
    setTarget(Math.floor(Math.random() * max) + 1);
  };

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num)) return;
    sounds.click();
    setAttempts(a => a + 1);

    if (num === target) {
      setWon(true);
      setHint('🎉 Correct!');
      sounds.win();
      const score = Math.max(1000 - attempts * 50 + (maxNum / 10), 10);
      saveScore('number-guess', Math.round(score));
    } else if (num < target) {
      setHint('📈 Too low!');
      sounds.pop();
    } else {
      setHint('📉 Too high!');
      sounds.pop();
    }
    setGuess('');
  };

  if (!difficulty) {
    return (
      <GameLayout title="Number Guessing" gameId="number-guess" onRestart={() => setDifficulty(null)} showScore={false}>
        <div className="flex flex-col gap-4 items-center">
          <p className="text-muted-foreground mb-2">Pick a range</p>
          <button className="btn-game w-48" onClick={() => startGame(50)}>1–50 (Easy)</button>
          <button className="btn-game-secondary w-48" onClick={() => startGame(100)}>1–100 (Medium)</button>
          <button className="btn-game-secondary w-48" onClick={() => startGame(500)}>1–500 (Hard)</button>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Number Guessing" gameId="number-guess" onRestart={restart}>
      <div className="text-center max-w-sm">
        <p className="text-muted-foreground mb-4">Guess a number between 1 and {maxNum}</p>
        <p className="text-sm text-muted-foreground mb-2">Attempts: {attempts}</p>

        {hint && (
          <motion.p
            key={hint + attempts}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-display font-bold text-xl mb-4 ${won ? 'text-success' : 'text-accent'}`}
          >
            {hint}
          </motion.p>
        )}

        {won ? (
          <button className="btn-game" onClick={restart}>Play Again</button>
        ) : (
          <div className="flex gap-2 justify-center">
            <input
              type="number"
              value={guess}
              onChange={e => setGuess(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGuess()}
              className="w-28 px-4 py-3 rounded-xl bg-secondary border border-border text-foreground text-center font-display text-xl focus:outline-none focus:border-primary"
              placeholder="?"
              min={1}
              max={maxNum}
            />
            <button className="btn-game" onClick={handleGuess}>Guess</button>
          </div>
        )}
      </div>
    </GameLayout>
  );
};

export default NumberGuessing;
