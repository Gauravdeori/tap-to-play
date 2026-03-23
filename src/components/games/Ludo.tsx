import { useState, useCallback, useEffect } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion, AnimatePresence } from 'framer-motion';
import { Dice5, Trophy, User } from 'lucide-react';

type PlayerColor = 'red' | 'blue';

interface Piece {
  id: number;
  color: PlayerColor;
  position: number; // -1 means in base, 0-51 are path, 52-57 are home stretch
  isFinished: boolean;
}

const BOARD_SIZE = 15;
const PATH_LENGTH = 52;
const HOME_STRETCH = 6;

// Simplified paths for Red and Blue
const RED_START = 0;
const BLUE_START = 26;
const RED_ENTRY = 51;
const BLUE_ENTRY = 25;

const Ludo = () => {
  const [pieces, setPieces] = useState<Piece[]>([
    { id: 1, color: 'red', position: -1, isFinished: false },
    { id: 2, color: 'red', position: -1, isFinished: false },
    { id: 11, color: 'blue', position: -1, isFinished: false },
    { id: 12, color: 'blue', position: -1, isFinished: false },
  ]);

  const [turn, setTurn] = useState<PlayerColor>('red');
  const [dice, setDice] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [message, setMessage] = useState<string>("Red's turn. Roll the dice!");

  const rollDice = () => {
    if (isRolling || dice !== null || winner) return;
    setIsRolling(true);
    sounds.tick();
    
    setTimeout(() => {
      const val = Math.floor(Math.random() * 6) + 1;
      setDice(val);
      setIsRolling(false);
      
      const movable = getMovablePieces(val);
      if (movable.length === 0) {
        setMessage(`No moves for ${turn}. Next turn!`);
        setTimeout(() => {
          setDice(null);
          setTurn(turn === 'red' ? 'blue' : 'red');
          setMessage(`${turn === 'red' ? 'Blue' : 'Red'}'s turn.`);
        }, 1500);
      } else {
        setMessage("Select a piece to move.");
      }
    }, 600);
  };

  const getPiecePathPos = (piece: Piece, diceVal: number) => {
    if (piece.position === -1) {
      return diceVal === 6 ? (piece.color === 'red' ? RED_START : BLUE_START) : -1;
    }
    
    // Logic for home stretch and finishing
    // This is a simplified version
    let newPos = piece.position + diceVal;
    if (newPos >= PATH_LENGTH + HOME_STRETCH) return -1; // Can't over-reach finish
    return newPos;
  };

  const getMovablePieces = (diceVal: number) => {
    return pieces.filter(p => p.color === turn && !p.isFinished && getPiecePathPos(p, diceVal) !== -1);
  };

  const movePiece = (pieceId: number) => {
    if (dice === null || isRolling || winner) return;
    
    const piece = pieces.find(p => p.id === pieceId);
    if (!piece || piece.color !== turn) return;

    const newPos = getPiecePathPos(piece, dice);
    if (newPos === -1) return;

    sounds.pop();
    
    const updatedPieces = pieces.map(p => {
      if (p.id === pieceId) {
        const finished = newPos === (PATH_LENGTH + HOME_STRETCH - 1);
        return { ...p, position: newPos, isFinished: finished };
      }
      
      // Check for kicking opponent (simplified)
      if (newPos < PATH_LENGTH && p.color !== turn && p.position === newPos && p.position !== -1) {
        sounds.lose();
        return { ...p, position: -1 };
      }
      return p;
    });

    setPieces(updatedPieces);
    
    // Check winner
    const team = updatedPieces.filter(p => p.color === turn);
    if (team.every(p => p.isFinished)) {
      setWinner(turn);
      sounds.win();
      saveScore('ludo', 500);
      return;
    }

    setDice(null);
    if (dice !== 6) {
      setTurn(turn === 'red' ? 'blue' : 'red');
      setMessage(`${turn === 'red' ? 'Blue' : 'Red'}'s turn.`);
    } else {
      setMessage("Rolled a 6! Roll again!");
    }
  };

  const restart = () => {
    setPieces([
      { id: 1, color: 'red', position: -1, isFinished: false },
      { id: 2, color: 'red', position: -1, isFinished: false },
      { id: 11, color: 'blue', position: -1, isFinished: false },
      { id: 12, color: 'blue', position: -1, isFinished: false },
    ]);
    setTurn('red');
    setDice(null);
    setWinner(null);
    setMessage("Red's turn. Roll the dice!");
  };

  return (
    <GameLayout title="Ludo" gameId="ludo" onRestart={restart} showScore={false}>
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl px-4">
        {winner && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center gap-2 p-6 rounded-3xl bg-card border-2 border-primary shadow-glow mb-4"
          >
            <Trophy className="w-12 h-12 text-warning mb-2" />
            <h2 className="font-display font-bold text-3xl capitalize text-gradient-primary">{winner} Wins!</h2>
            <button onClick={restart} className="btn-game mt-4">Play Again</button>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-8 w-full mb-4">
          <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${turn === 'red' ? 'border-red-500 bg-red-500/10 shadow-[0_0_15px_-3px_rgba(239,68,68,0.4)]' : 'border-transparent opacity-50'}`}>
            <User className="w-8 h-8 text-red-500" />
            <span className="font-display font-bold text-red-500">Player 1 (Red)</span>
            <div className="flex gap-2">
              {pieces.filter(p => p.color === 'red' && p.position === -1).map(p => (
                <div key={p.id} className="w-6 h-6 rounded-full bg-red-500" />
              ))}
            </div>
          </div>
          <div className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${turn === 'blue' ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]' : 'border-transparent opacity-50'}`}>
            <User className="w-8 h-8 text-blue-500" />
            <span className="font-display font-bold text-blue-500">Player 2 (Blue)</span>
            <div className="flex gap-2">
              {pieces.filter(p => p.color === 'blue' && p.position === -1).map(p => (
                <div key={p.id} className="w-6 h-6 rounded-full bg-blue-500" />
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-6">
          <div className="text-center font-display font-medium text-lg text-muted-foreground animate-fade-in h-8">
            {message}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={rollDice}
            disabled={dice !== null || isRolling || !!winner}
            className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl shadow-card transition-all ${
              dice === null && !isRolling ? 'bg-primary text-white cursor-pointer hover:shadow-glow' : 'bg-secondary text-muted-foreground cursor-not-allowed'
            }`}
          >
            {isRolling ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5, ease: "linear" }}>
                <Dice5 className="w-12 h-12" />
              </motion.div>
            ) : dice ? (
              <span className="font-display font-bold text-5xl">{dice}</span>
            ) : (
              <Dice5 className="w-12 h-12" />
            )}
          </motion.button>

          <div className="grid grid-cols-2 gap-4 mt-4 h-32 items-center">
            {pieces.filter(p => p.color === turn && !p.isFinished).map(p => {
              const movable = dice !== null && getPiecePathPos(p, dice) !== -1;
              return (
                <motion.button
                  key={p.id}
                  whileHover={movable ? { scale: 1.1 } : {}}
                  whileTap={movable ? { scale: 0.9 } : {}}
                  onClick={() => movePiece(p.id)}
                  disabled={!movable}
                  className={`relative p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${
                    movable 
                    ? `cursor-pointer ${turn === 'red' ? 'border-red-500 bg-red-500/20' : 'border-blue-500 bg-blue-500/20'} shadow-glow animate-pulse-glow` 
                    : 'opacity-40 cursor-not-allowed border-border bg-secondary'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full shadow-lg ${p.color === 'red' ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {p.position === -1 ? 'In Base' : `At ${p.position}`}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-muted-foreground max-w-md">
          <p>Roll a 6 to bring a piece out of the base. Get both pieces to the finish line to win!</p>
        </div>
      </div>
    </GameLayout>
  );
};

export default Ludo;
