import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Gamepad2 } from 'lucide-react';
import GameCard from '@/components/GameCard';
import ThemeToggle from '@/components/ThemeToggle';

const games = [
  { title: 'Tic Tac Toe', description: '2 player or vs AI. Classic strategy!', icon: '❌', path: '/game/tic-tac-toe', gradient: 'bg-gradient-primary' },
  { title: 'Rock Paper Scissors', description: 'Beat the computer. Best of rounds!', icon: '✊', path: '/game/rps', gradient: 'bg-gradient-accent' },
  { title: 'Memory Flip', description: 'Match pairs. Test your memory!', icon: '🃏', path: '/game/memory', gradient: 'bg-gradient-primary' },
  { title: 'Number Guessing', description: 'Guess the secret number!', icon: '🔢', path: '/game/number-guess', gradient: 'bg-gradient-accent' },
  { title: 'Reaction Time', description: 'How fast can you react?', icon: '⚡', path: '/game/reaction', gradient: 'bg-gradient-primary' },
  { title: 'Snake', description: 'Eat, grow, survive!', icon: '🐍', path: '/game/snake', gradient: 'bg-gradient-accent' },
  { title: 'Aim Trainer', description: 'Click targets as fast as you can!', icon: '🎯', path: '/game/aim', gradient: 'bg-gradient-primary' },
  { title: 'Tap Speed', description: 'Tap as fast as possible!', icon: '👆', path: '/game/tap-speed', gradient: 'bg-gradient-accent' },
  { title: 'Brick Breaker', description: 'Smash all the bricks!', icon: '🧱', path: '/game/brick-breaker', gradient: 'bg-gradient-primary' },
  { title: 'Whack-a-Mole', description: 'Whack the moles before they hide!', icon: '🐹', path: '/game/whack-a-mole', gradient: 'bg-gradient-accent' },
  { title: 'Color Match', description: 'Does the color match the word?', icon: '🎨', path: '/game/color-match', gradient: 'bg-gradient-primary' },
  { title: 'Typing Speed', description: 'Type words as fast as you can!', icon: '⌨️', path: '/game/typing-speed', gradient: 'bg-gradient-accent' },
  { title: 'Math Sprint', description: 'Solve math problems fast!', icon: '🧮', path: '/game/math-sprint', gradient: 'bg-gradient-primary' },
  { title: 'Ludo', description: '2 player classic board game!', icon: '🎲', path: '/game/ludo', gradient: 'bg-gradient-accent' },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="pt-8 pb-6 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-gradient-primary">
              TapPlay
            </h1>
          </div>
          <p className="text-muted-foreground text-lg font-body">Mini Games Hub — Pick a game and play!</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <div className="flex items-center gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/leaderboard')} className="btn-game-secondary text-sm">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </button>
            <ThemeToggle />
          </div>
        </motion.div>
      </header>

      {/* Game Grid */}
      <div className="container max-w-5xl pb-12">
        <div className="game-grid">
          {games.map((game, i) => (
            <GameCard key={game.path} {...game} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
