import { useState, useCallback, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion } from 'framer-motion';

type Phase = 'waiting' | 'ready' | 'go' | 'result' | 'too-early';

const ReactionTime = () => {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const startRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const restart = useCallback(() => {
    setPhase('waiting');
    setReactionTime(0);
    setBestTime(null);
    clearTimeout(timerRef.current);
  }, []);

  const startRound = () => {
    setPhase('ready');
    sounds.click();
    const delay = 1500 + Math.random() * 3500;
    timerRef.current = setTimeout(() => {
      setPhase('go');
      startRef.current = Date.now();
    }, delay);
  };

  const handleClick = () => {
    if (phase === 'waiting') {
      startRound();
    } else if (phase === 'ready') {
      clearTimeout(timerRef.current);
      setPhase('too-early');
      sounds.lose();
    } else if (phase === 'go') {
      const time = Date.now() - startRef.current;
      setReactionTime(time);
      setPhase('result');
      sounds.win();
      if (!bestTime || time < bestTime) {
        setBestTime(time);
      }
      const score = Math.max(1000 - time, 0);
      saveScore('reaction', Math.round(score));
    } else if (phase === 'result' || phase === 'too-early') {
      startRound();
    }
  };

  const bgColor = phase === 'ready'
    ? 'bg-destructive/20 border-destructive/50'
    : phase === 'go'
    ? 'bg-success/20 border-success/50'
    : phase === 'too-early'
    ? 'bg-destructive/10 border-destructive/30'
    : 'bg-secondary border-border';

  return (
    <GameLayout title="Reaction Time" gameId="reaction" onRestart={restart} showScore={false}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={handleClick}
        className={`w-full max-w-md h-64 rounded-2xl border flex flex-col items-center justify-center transition-colors duration-200 ${bgColor}`}
      >
        {phase === 'waiting' && (
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-foreground mb-2">Click to Start</p>
            <p className="text-muted-foreground text-sm">Test your reaction time</p>
          </div>
        )}
        {phase === 'ready' && (
          <p className="font-display font-bold text-2xl text-destructive">Wait for green...</p>
        )}
        {phase === 'go' && (
          <p className="font-display font-bold text-3xl text-success animate-bounce-in">CLICK NOW!</p>
        )}
        {phase === 'too-early' && (
          <div className="text-center">
            <p className="font-display font-bold text-2xl text-destructive mb-2">Too early!</p>
            <p className="text-muted-foreground text-sm">Click to try again</p>
          </div>
        )}
        {phase === 'result' && (
          <div className="text-center">
            <p className="font-display font-bold text-4xl text-primary mb-2">{reactionTime}ms</p>
            {bestTime && <p className="text-sm text-muted-foreground">Best: {bestTime}ms</p>}
            <p className="text-muted-foreground text-sm mt-2">Click to try again</p>
          </div>
        )}
      </motion.button>
    </GameLayout>
  );
};

export default ReactionTime;
