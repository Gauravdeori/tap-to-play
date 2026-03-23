import { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion, AnimatePresence } from 'framer-motion';

const TOTAL = 20;
const AREA = { w: 320, h: 320 };

const AimTrainer = () => {
  const [target, setTarget] = useState<{ x: number; y: number; size: number } | null>(null);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const spawnTarget = useCallback(() => {
    const size = 30 + Math.random() * 30;
    const x = Math.random() * (AREA.w - size);
    const y = Math.random() * (AREA.h - size);
    setTarget({ x, y, size });
  }, []);

  const start = () => {
    setStarted(true);
    setDone(false);
    setHits(0);
    setMisses(0);
    setStartTime(Date.now());
    spawnTarget();
  };

  const handleHit = () => {
    sounds.pop();
    const newHits = hits + 1;
    setHits(newHits);
    if (newHits >= TOTAL) {
      const time = Date.now() - startTime;
      setTotalTime(time);
      setDone(true);
      setTarget(null);
      sounds.win();
      const score = Math.max(Math.round(TOTAL * 1000 / (time / 1000)) - misses * 50, 10);
      saveScore('aim', score);
    } else {
      spawnTarget();
    }
  };

  const handleMiss = () => {
    setMisses(m => m + 1);
  };

  const restart = () => {
    setStarted(false);
    setDone(false);
    setTarget(null);
    setHits(0);
    setMisses(0);
  };

  return (
    <GameLayout title="Aim Trainer" gameId="aim" onRestart={restart} showScore={false}>
      {!started ? (
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Click {TOTAL} targets as fast as you can!</p>
          <button className="btn-game" onClick={start}>Start</button>
        </div>
      ) : done ? (
        <div className="text-center">
          <p className="font-display font-bold text-3xl text-primary mb-2">{(totalTime / 1000).toFixed(2)}s</p>
          <p className="text-muted-foreground">Hits: {hits} · Misses: {misses}</p>
          <button className="btn-game mt-4" onClick={start}>Play Again</button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground mb-3">{hits}/{TOTAL} hits · {misses} misses</p>
          <div
            className="relative border border-border rounded-2xl overflow-hidden bg-secondary cursor-crosshair"
            style={{ width: AREA.w, height: AREA.h }}
            onClick={handleMiss}
          >
            <AnimatePresence>
              {target && (
                <motion.button
                  key={`${target.x}-${target.y}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  onClick={(e) => { e.stopPropagation(); handleHit(); }}
                  className="absolute rounded-full bg-gradient-primary shadow-glow"
                  style={{
                    left: target.x,
                    top: target.y,
                    width: target.size,
                    height: target.size,
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </GameLayout>
  );
};

export default AimTrainer;
