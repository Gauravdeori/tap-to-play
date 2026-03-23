import { useState } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion, AnimatePresence } from 'framer-motion';

const choices = ['🪨', '📄', '✂️'] as const;
const names = ['Rock', 'Paper', 'Scissors'];

const getResult = (p: number, c: number): 'win' | 'lose' | 'draw' => {
  if (p === c) return 'draw';
  if ((p + 1) % 3 === c) return 'lose';
  return 'win';
};

const RPS = () => {
  const [playerChoice, setPlayerChoice] = useState<number | null>(null);
  const [cpuChoice, setCpuChoice] = useState<number | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [round, setRound] = useState(0);

  const play = (choice: number) => {
    sounds.click();
    const cpu = Math.floor(Math.random() * 3);
    const res = getResult(choice, cpu);
    setPlayerChoice(choice);
    setCpuChoice(cpu);
    setResult(res);
    setRound(r => r + 1);

    if (res === 'win') {
      sounds.win();
      const newStreak = streak + 1;
      setStreak(newStreak);
      const pts = score + 10 + newStreak * 5;
      setScore(pts);
      saveScore('rps', pts);
    } else if (res === 'lose') {
      sounds.lose();
      setStreak(0);
    }
  };

  const restart = () => {
    setPlayerChoice(null);
    setCpuChoice(null);
    setResult(null);
    setScore(0);
    setStreak(0);
    setRound(0);
  };

  return (
    <GameLayout title="Rock Paper Scissors" gameId="rps" onRestart={restart} score={score}>
      <p className="text-sm text-muted-foreground mb-2">Round {round} · Streak: {streak}</p>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={round}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center mb-6"
          >
            <div className="flex items-center justify-center gap-6 text-5xl mb-4">
              <span>{choices[playerChoice!]}</span>
              <span className="text-muted-foreground text-lg">vs</span>
              <span>{choices[cpuChoice!]}</span>
            </div>
            <p className={`font-display font-bold text-xl ${result === 'win' ? 'text-success' : result === 'lose' ? 'text-destructive' : 'text-muted-foreground'}`}>
              {result === 'win' ? 'You Win!' : result === 'lose' ? 'You Lose!' : 'Draw!'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4">
        {choices.map((emoji, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => play(i)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-secondary border border-border text-4xl flex items-center justify-center hover:border-primary/50 transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        {names.map((n, i) => (
          <span key={i} className="text-xs text-muted-foreground w-20 sm:w-24 text-center">{n}</span>
        ))}
      </div>
    </GameLayout>
  );
};

export default RPS;
