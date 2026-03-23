import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy } from 'lucide-react';
import { getTopScores } from '@/lib/scores';

const gameNames: Record<string, string> = {
  'tic-tac-toe': 'Tic Tac Toe',
  'rps': 'Rock Paper Scissors',
  'memory': 'Memory Flip',
  'number-guess': 'Number Guessing',
  'reaction': 'Reaction Time',
  'snake': 'Snake',
  'aim': 'Aim Trainer',
  'tap-speed': 'Tap Speed',
  'brick-breaker': 'Brick Breaker',
};

const Leaderboard = () => {
  const navigate = useNavigate();
  const scores = getTopScores(undefined, 30);

  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <button onClick={() => navigate('/')} className="btn-game-secondary !px-3 !py-2 text-sm">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-display font-bold text-lg text-gradient-primary flex items-center gap-2">
          <Trophy className="w-5 h-5 text-warning" /> Global Leaderboard
        </h1>
      </header>
      <div className="container max-w-2xl py-8">
        {scores.length === 0 ? (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-muted-foreground py-12">
            No scores yet. Go play some games!
          </motion.p>
        ) : (
          <div className="space-y-2">
            {scores.map((entry, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <span className={`font-display font-bold text-lg w-8 text-center ${i < 3 ? 'text-warning' : 'text-muted-foreground'}`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{gameNames[entry.game] || entry.game}</p>
                  <p className="text-xs text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</p>
                </div>
                <span className="font-display font-bold text-xl text-primary">{entry.score}</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
