import { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion } from 'framer-motion';

const DURATION = 10;

const TapSpeed = () => {
  const [taps, setTaps] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const start = () => {
    setTaps(0);
    setTimeLeft(DURATION);
    setRunning(true);
    setDone(false);
    intervalRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setDone(true);
          sounds.gameOver();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (done) {
      saveScore('tap-speed', taps);
    }
  }, [done, taps]);

  const handleTap = () => {
    if (!running && !done) {
      start();
    }
    if (running) {
      sounds.tick();
      setTaps(t => t + 1);
    }
  };

  const restart = () => {
    clearInterval(intervalRef.current);
    setTaps(0);
    setTimeLeft(DURATION);
    setRunning(false);
    setDone(false);
  };

  return (
    <GameLayout title="Tap Speed" gameId="tap-speed" onRestart={restart} showScore={false}>
      <div className="text-center">
        <p className="font-display font-bold text-5xl text-primary mb-2">{taps}</p>
        <p className="text-muted-foreground text-sm mb-1">taps</p>
        {running && (
          <p className="font-display font-bold text-2xl text-accent mb-4">{timeLeft}s</p>
        )}
      </div>

      {done ? (
        <div className="text-center">
          <p className="font-display font-bold text-2xl text-success mb-2">
            {(taps / DURATION).toFixed(1)} taps/sec
          </p>
          <button className="btn-game mt-4" onClick={restart}>Try Again</button>
        </div>
      ) : (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleTap}
          className="w-48 h-48 rounded-full bg-gradient-primary shadow-glow flex items-center justify-center font-display font-bold text-xl text-primary-foreground select-none"
        >
          {running ? 'TAP!' : 'Start Tapping!'}
        </motion.button>
      )}
    </GameLayout>
  );
};

export default TapSpeed;
