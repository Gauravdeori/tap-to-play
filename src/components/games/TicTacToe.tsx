import { useState, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion } from 'framer-motion';

type Player = 'X' | 'O' | null;
type Mode = '2p' | 'ai' | null;

const winLines = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

const checkWinner = (b: Player[]): Player => {
  for (const [a, b2, c] of winLines) {
    if (b[a] && b[a] === b[b2] && b[a] === b[c]) return b[a];
  }
  return null;
};

const minimax = (board: Player[], isMax: boolean): number => {
  const w = checkWinner(board);
  if (w === 'O') return 10;
  if (w === 'X') return -10;
  if (board.every(c => c)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'O';
        best = Math.max(best, minimax(board, false));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = 'X';
        best = Math.min(best, minimax(board, true));
        board[i] = null;
      }
    }
    return best;
  }
};

const getAiMove = (board: Player[]): number => {
  let bestVal = -Infinity, bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const val = minimax(board, false);
      board[i] = null;
      if (val > bestVal) { bestVal = val; bestMove = i; }
    }
  }
  return bestMove;
};

const TicTacToe = () => {
  const [mode, setMode] = useState<Mode>(null);
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [score, setScore] = useState(0);

  const restart = useCallback(() => {
    setBoard(Array(9).fill(null));
    setTurn('X');
    setWinner(null);
  }, []);

  const fullRestart = () => {
    restart();
    setMode(null);
    setScore(0);
  };

  const handleClick = (i: number) => {
    if (board[i] || winner) return;
    sounds.click();
    const newBoard = [...board];
    newBoard[i] = turn;

    const w = checkWinner(newBoard);
    if (w) {
      setWinner(w);
      sounds.win();
      if (mode === 'ai' && w === 'X') {
        const s = score + 100;
        setScore(s);
        saveScore('tic-tac-toe', s);
      }
      setBoard(newBoard);
      return;
    }
    if (newBoard.every(c => c)) {
      setWinner('draw');
      setBoard(newBoard);
      return;
    }

    if (mode === 'ai') {
      setBoard(newBoard);
      const aiMove = getAiMove([...newBoard]);
      if (aiMove >= 0) {
        newBoard[aiMove] = 'O';
        const w2 = checkWinner(newBoard);
        if (w2) {
          setWinner(w2);
          sounds.lose();
        } else if (newBoard.every(c => c)) {
          setWinner('draw');
        }
      }
      setBoard([...newBoard]);
    } else {
      setTurn(turn === 'X' ? 'O' : 'X');
      setBoard(newBoard);
    }
  };

  if (!mode) {
    return (
      <GameLayout title="Tic Tac Toe" gameId="tic-tac-toe" onRestart={fullRestart} showScore={false}>
        <div className="flex flex-col gap-4 items-center">
          <p className="text-muted-foreground mb-2">Choose mode</p>
          <button className="btn-game w-48" onClick={() => { setMode('2p'); sounds.click(); }}>2 Players</button>
          <button className="btn-game-secondary w-48" onClick={() => { setMode('ai'); sounds.click(); }}>vs Computer</button>
        </div>
      </GameLayout>
    );
  }

  return (
    <GameLayout title="Tic Tac Toe" gameId="tic-tac-toe" onRestart={fullRestart} score={score} showScore={mode === 'ai'}>
      {winner ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-6">
          <p className="font-display font-bold text-2xl text-foreground">
            {winner === 'draw' ? "It's a Draw!" : `${winner} Wins!`}
          </p>
          <button className="btn-game mt-4" onClick={restart}>Play Again</button>
        </motion.div>
      ) : (
        <p className="text-muted-foreground mb-4 font-display">
          {mode === 'ai' ? "Your turn (X)" : `${turn}'s turn`}
        </p>
      )}
      <div className="grid grid-cols-3 gap-2 w-fit">
        {board.map((cell, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(i)}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-secondary border border-border flex items-center justify-center font-display font-bold text-3xl transition-colors hover:border-primary/50"
          >
            {cell && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cell === 'X' ? 'text-primary' : 'text-accent'}
              >
                {cell}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </GameLayout>
  );
};

export default TicTacToe;
