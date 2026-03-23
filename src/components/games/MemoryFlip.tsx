import { useState, useEffect, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion } from 'framer-motion';

const emojis = ['🎮', '🎲', '🎯', '🏆', '⭐', '🔥', '💎', '🚀'];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

const MemoryFlip = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [pairs, setPairs] = useState(0);
  const [difficulty, setDifficulty] = useState<4 | 6 | 8>(4);
  const [gameStarted, setGameStarted] = useState(false);

  const initGame = useCallback((diff: 4 | 6 | 8) => {
    const pairCount = (diff * diff) / 2;
    const selected = emojis.slice(0, pairCount);
    // For non-square grids, use pairs that fit
    const doubled = [...selected, ...selected];
    const shuffled = doubled.sort(() => Math.random() - 0.5).map((emoji, i) => ({
      id: i, emoji, flipped: false, matched: false,
    }));
    setCards(shuffled);
    setSelected([]);
    setMoves(0);
    setPairs(0);
    setDifficulty(diff);
    setGameStarted(true);
  }, []);

  const handleFlip = (idx: number) => {
    if (selected.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
    sounds.pop();

    const newCards = [...cards];
    newCards[idx].flipped = true;
    setCards(newCards);

    const newSelected = [...selected, idx];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSelected;
      if (newCards[a].emoji === newCards[b].emoji) {
        sounds.match();
        newCards[a].matched = true;
        newCards[b].matched = true;
        setCards([...newCards]);
        setSelected([]);
        const newPairs = pairs + 1;
        setPairs(newPairs);

        if (newCards.every(c => c.matched)) {
          sounds.win();
          const score = Math.max(1000 - (moves + 1) * 20 + difficulty * 50, 10);
          saveScore('memory', score);
        }
      } else {
        setTimeout(() => {
          newCards[a].flipped = false;
          newCards[b].flipped = false;
          setCards([...newCards]);
          setSelected([]);
        }, 800);
      }
    }
  };

  const totalPairs = cards.length / 2;
  const isComplete = cards.length > 0 && cards.every(c => c.matched);
  const score = isComplete ? Math.max(1000 - moves * 20 + difficulty * 50, 10) : 0;

  const restart = () => {
    setGameStarted(false);
  };

  if (!gameStarted) {
    return (
      <GameLayout title="Memory Flip" gameId="memory" onRestart={restart} showScore={false}>
        <div className="flex flex-col gap-4 items-center">
          <p className="text-muted-foreground mb-2">Choose grid size</p>
          <button className="btn-game w-48" onClick={() => initGame(4)}>4×4 (Easy)</button>
          <button className="btn-game-secondary w-48" onClick={() => initGame(6)}>4×6 (Medium)</button>
          <button className="btn-game-secondary w-48" onClick={() => initGame(8)}>4×8 (Hard)</button>
        </div>
      </GameLayout>
    );
  }

  const cols = difficulty === 4 ? 4 : 4;
  
  return (
    <GameLayout title="Memory Flip" gameId="memory" onRestart={restart} score={score} showScore={isComplete}>
      <div className="text-center mb-4">
        <p className="text-sm text-muted-foreground">Moves: {moves} · Pairs: {pairs}/{totalPairs}</p>
      </div>
      {isComplete && (
        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="mb-4 text-center">
          <p className="font-display font-bold text-2xl text-success">🎉 Complete!</p>
          <p className="text-muted-foreground">Score: {score}</p>
          <button className="btn-game mt-3" onClick={restart}>Play Again</button>
        </motion.div>
      )}
      <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFlip(i)}
            className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
              card.flipped || card.matched
                ? 'bg-primary/20 border-primary/50 border'
                : 'bg-secondary border border-border hover:border-primary/30'
            } ${card.matched ? 'opacity-60' : ''}`}
          >
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </motion.button>
        ))}
      </div>
    </GameLayout>
  );
};

export default MemoryFlip;
