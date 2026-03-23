import { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Pos = { x: number; y: number };

const GRID = 20;
const CELL = 18;
const SPEED_INITIAL = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Pos>({ x: 15, y: 10 });
  const [dir, setDir] = useState<Dir>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const dirRef = useRef<Dir>('RIGHT');
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const spawnFood = useCallback((snk: Pos[]) => {
    let pos: Pos;
    do {
      pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
    } while (snk.some(s => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  const restart = useCallback(() => {
    const initial = [{ x: 10, y: 10 }];
    setSnake(initial);
    setFood(spawnFood(initial));
    setDir('RIGHT');
    dirRef.current = 'RIGHT';
    setGameOver(false);
    setScore(0);
    setRunning(false);
    clearInterval(intervalRef.current);
  }, [spawnFood]);

  const tick = useCallback(() => {
    setSnake(prev => {
      const head = { ...prev[0] };
      const d = dirRef.current;
      if (d === 'UP') head.y--;
      else if (d === 'DOWN') head.y++;
      else if (d === 'LEFT') head.x--;
      else head.x++;

      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || prev.some(s => s.x === head.x && s.y === head.y)) {
        setGameOver(true);
        setRunning(false);
        clearInterval(intervalRef.current);
        sounds.gameOver();
        saveScore('snake', prev.length - 1);
        return prev;
      }

      const newSnake = [head, ...prev];
      setFood(f => {
        if (head.x === f.x && head.y === f.y) {
          sounds.pop();
          setScore(s => s + 10);
          const spawned = spawnFood(newSnake);
          setTimeout(() => setFood(spawned), 0);
          return f;
        }
        newSnake.pop();
        return f;
      });
      return newSnake;
    });
  }, [spawnFood]);

  useEffect(() => {
    if (running && !gameOver) {
      const speed = Math.max(SPEED_INITIAL - score, 50);
      intervalRef.current = setInterval(tick, speed);
      return () => clearInterval(intervalRef.current);
    }
  }, [running, gameOver, tick, score]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const d = dirRef.current;
      if (e.key === 'ArrowUp' && d !== 'DOWN') { dirRef.current = 'UP'; setDir('UP'); }
      else if (e.key === 'ArrowDown' && d !== 'UP') { dirRef.current = 'DOWN'; setDir('DOWN'); }
      else if (e.key === 'ArrowLeft' && d !== 'RIGHT') { dirRef.current = 'LEFT'; setDir('LEFT'); }
      else if (e.key === 'ArrowRight' && d !== 'LEFT') { dirRef.current = 'RIGHT'; setDir('RIGHT'); }
      if (!running && !gameOver) setRunning(true);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [running, gameOver]);

  const handleSwipe = (newDir: Dir) => {
    const d = dirRef.current;
    if (newDir === 'UP' && d !== 'DOWN') { dirRef.current = 'UP'; setDir('UP'); }
    else if (newDir === 'DOWN' && d !== 'UP') { dirRef.current = 'DOWN'; setDir('DOWN'); }
    else if (newDir === 'LEFT' && d !== 'RIGHT') { dirRef.current = 'LEFT'; setDir('LEFT'); }
    else if (newDir === 'RIGHT' && d !== 'LEFT') { dirRef.current = 'RIGHT'; setDir('RIGHT'); }
    if (!running && !gameOver) setRunning(true);
  };

  return (
    <GameLayout title="Snake" gameId="snake" onRestart={restart} score={score}>
      {gameOver && (
        <div className="mb-4 text-center">
          <p className="font-display font-bold text-2xl text-destructive">Game Over!</p>
          <button className="btn-game mt-2" onClick={restart}>Play Again</button>
        </div>
      )}
      {!running && !gameOver && (
        <p className="text-muted-foreground text-sm mb-3">Press arrow keys or use buttons to start</p>
      )}
      <div
        className="relative border border-border rounded-xl overflow-hidden bg-secondary"
        style={{ width: GRID * CELL, height: GRID * CELL }}
      >
        {snake.map((s, i) => (
          <div
            key={i}
            className={`absolute rounded-sm ${i === 0 ? 'bg-primary' : 'bg-primary/60'}`}
            style={{ left: s.x * CELL, top: s.y * CELL, width: CELL - 1, height: CELL - 1 }}
          />
        ))}
        <div
          className="absolute rounded-full bg-accent"
          style={{ left: food.x * CELL, top: food.y * CELL, width: CELL - 1, height: CELL - 1 }}
        />
      </div>
      {/* Mobile controls */}
      <div className="mt-4 grid grid-cols-3 gap-2 w-36 sm:hidden">
        <div />
        <button onClick={() => handleSwipe('UP')} className="btn-game-secondary !px-2 !py-2 text-lg">↑</button>
        <div />
        <button onClick={() => handleSwipe('LEFT')} className="btn-game-secondary !px-2 !py-2 text-lg">←</button>
        <button onClick={() => handleSwipe('DOWN')} className="btn-game-secondary !px-2 !py-2 text-lg">↓</button>
        <button onClick={() => handleSwipe('RIGHT')} className="btn-game-secondary !px-2 !py-2 text-lg">→</button>
      </div>
    </GameLayout>
  );
};

export default SnakeGame;
