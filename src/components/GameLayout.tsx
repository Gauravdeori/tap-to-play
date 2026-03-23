import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { getHighScore } from '@/lib/scores';

interface GameLayoutProps {
  title: string;
  gameId: string;
  children: ReactNode;
  onRestart: () => void;
  score?: number;
  showScore?: boolean;
}

const GameLayout = ({ title, gameId, children, onRestart, score, showScore = true }: GameLayoutProps) => {
  const navigate = useNavigate();
  const highScore = getHighScore(gameId);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <button onClick={() => navigate('/')} className="btn-game-secondary !px-3 !py-2 text-sm">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </button>
        <h1 className="font-display font-bold text-lg text-gradient-primary">{title}</h1>
        <div className="flex items-center gap-2">
          {showScore && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Trophy className="w-3.5 h-3.5 text-warning" />
              <span>{highScore}</span>
            </div>
          )}
          <button onClick={onRestart} className="btn-game-secondary !px-3 !py-2 text-sm">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col items-center justify-center p-4"
      >
        {showScore && score !== undefined && (
          <div className="mb-4 text-center">
            <span className="text-sm text-muted-foreground">Score: </span>
            <span className="font-display font-bold text-xl text-foreground">{score}</span>
          </div>
        )}
        {children}
      </motion.main>
    </div>
  );
};

export default GameLayout;
