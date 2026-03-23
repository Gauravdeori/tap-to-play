import { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion, AnimatePresence } from 'framer-motion';

const GAME_DURATION = 30;
const GRID_SIZE = 9;

const WhackAMole = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [activeMoles, setActiveMoles] = useState<number[]>([]);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [whacked, setWhacked] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const moleRef = useRef<ReturnType<typeof setInterval>>();

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setActiveMoles([]);
    setGameActive(true);
    setGameOver(false);
    sounds.click();
  }, []);

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
    intervalRef.current = timer;
    return () => clearInterval(timer);
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;
    const speed = Math.max(400, 1000 - score * 15);
    const timer = setInterval(() => {
      const count = score > 15 ? 3 : score > 8 ? 2 : 1;
      const moles: number[] = [];
      while (moles.length < count) {
        const r = Math.floor(Math.random() * GRID_SIZE);
        if (!moles.includes(r)) moles.push(r);
      }
      setActiveMoles(moles);
    }, speed);
    moleRef.current = timer;
    return () => clearInterval(timer);
  }, [gameActive, score]);

  useEffect(() => {
    if (gameOver && score > 0) {
      saveScore('whack-a-mole', score);
      sounds.gameOver();
    }
  }, [gameOver, score]);

  const whackMole = (index: number) => {
    if (!gameActive || !activeMoles.includes(index)) return;
    sounds.pop();
    setWhacked(index);
    setScore(s => s + 1);
    setActiveMoles(m => m.filter(i => i !== index));
    setTimeout(() => setWhacked(null), 150);
  };

  const restart = () => {
    clearInterval(intervalRef.current);
    clearInterval(moleRef.current);
    setGameActive(false);
    setGameOver(false);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setActiveMoles([]);
  };

  return (
    <GameLayout title="Whack-a-Mole" gameId="whack-a-mole" onRestart={restart} score={score}>
      <div className="w-full max-w-sm mx-auto text-center">
        {!gameActive && !gameOver && (
          <button onClick={startGame} className="btn-game text-lg mb-6">Start Whacking!</button>
        )}
        {gameActive && (
          <div className="mb-4 text-sm text-muted-foreground">
            Time: <span className="font-bold text-foreground">{timeLeft}s</span>
          </div>
        )}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: GRID_SIZE }).map((_, i) => {
            const isActive = activeMoles.includes(i);
            const isWhacked = whacked === i;
            return (
              <button
                key={i}
                onClick={() => whackMole(i)}
                className={`aspect-square rounded-2xl border-2 transition-all duration-150 text-4xl flex items-center justify-center
                  ${isWhacked ? 'bg-warning/30 border-warning scale-90' : isActive ? 'bg-accent/20 border-accent scale-105 cursor-pointer' : 'bg-card border-border'}`}
              >
                <AnimatePresence>
                  {isActive && !isWhacked && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      🐹
                    </motion.span>
                  )}
                </AnimatePresence>
                {isWhacked && '💥'}
              </button>
            );
          })}
        </div>
        {gameOver && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
            <p className="text-2xl font-display font-bold text-foreground mb-2">Game Over!</p>
            <p className="text-muted-foreground mb-4">You whacked <span className="text-accent font-bold">{score}</span> moles!</p>
            <button onClick={startGame} className="btn-game">Play Again</button>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
};

export default WhackAMole;
