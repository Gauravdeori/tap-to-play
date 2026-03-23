import { useState, useEffect, useCallback, useRef } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';

const W = 320;
const H = 400;
const PADDLE_W = 60;
const PADDLE_H = 10;
const BALL_R = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_W = W / BRICK_COLS - 2;
const BRICK_H = 14;

interface Brick {
  x: number;
  y: number;
  alive: boolean;
}

const BrickBreaker = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [started, setStarted] = useState(false);
  const stateRef = useRef({
    paddleX: W / 2 - PADDLE_W / 2,
    ballX: W / 2,
    ballY: H - 30,
    dx: 3,
    dy: -3,
    bricks: [] as Brick[],
    score: 0,
    running: false,
  });
  const animRef = useRef<number>();

  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: c * (BRICK_W + 2) + 1,
          y: r * (BRICK_H + 2) + 30,
          alive: true,
        });
      }
    }
    return bricks;
  }, []);

  const start = useCallback(() => {
    const s = stateRef.current;
    s.paddleX = W / 2 - PADDLE_W / 2;
    s.ballX = W / 2;
    s.ballY = H - 30;
    s.dx = 3;
    s.dy = -3;
    s.bricks = initBricks();
    s.score = 0;
    s.running = true;
    setScore(0);
    setGameOver(false);
    setWon(false);
    setStarted(true);
  }, [initBricks]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const handleMove = (x: number) => {
      const rect = canvas.getBoundingClientRect();
      stateRef.current.paddleX = Math.max(0, Math.min(W - PADDLE_W, x - rect.left - PADDLE_W / 2));
    };

    const onMouse = (e: MouseEvent) => handleMove(e.clientX);
    const onTouch = (e: TouchEvent) => { e.preventDefault(); handleMove(e.touches[0].clientX); };

    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive: false });
    canvas.addEventListener('touchstart', onTouch, { passive: false });

    const draw = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = 'hsl(230, 20%, 10%)';
      ctx.fillRect(0, 0, W, H);

      // Bricks
      const colors = ['#8B5CF6', '#A855F7', '#C084FC', '#E879F9', '#F0ABFC'];
      s.bricks.forEach((b, i) => {
        if (!b.alive) return;
        ctx.fillStyle = colors[Math.floor(i / BRICK_COLS) % colors.length];
        ctx.fillRect(b.x, b.y, BRICK_W, BRICK_H);
      });

      // Paddle
      ctx.fillStyle = '#8B5CF6';
      ctx.beginPath();
      ctx.roundRect(s.paddleX, H - 20, PADDLE_W, PADDLE_H, 4);
      ctx.fill();

      // Ball
      ctx.fillStyle = '#F97316';
      ctx.beginPath();
      ctx.arc(s.ballX, s.ballY, BALL_R, 0, Math.PI * 2);
      ctx.fill();

      if (!s.running) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // Move ball
      s.ballX += s.dx;
      s.ballY += s.dy;

      // Wall collision
      if (s.ballX <= BALL_R || s.ballX >= W - BALL_R) s.dx = -s.dx;
      if (s.ballY <= BALL_R) s.dy = -s.dy;

      // Paddle collision
      if (
        s.ballY + BALL_R >= H - 20 &&
        s.ballX >= s.paddleX &&
        s.ballX <= s.paddleX + PADDLE_W &&
        s.dy > 0
      ) {
        s.dy = -s.dy;
        const hitPos = (s.ballX - s.paddleX) / PADDLE_W - 0.5;
        s.dx = hitPos * 6;
        sounds.pop();
      }

      // Bottom
      if (s.ballY > H) {
        s.running = false;
        setGameOver(true);
        sounds.gameOver();
        saveScore('brick-breaker', s.score);
      }

      // Brick collision
      s.bricks.forEach(b => {
        if (!b.alive) return;
        if (
          s.ballX + BALL_R > b.x &&
          s.ballX - BALL_R < b.x + BRICK_W &&
          s.ballY + BALL_R > b.y &&
          s.ballY - BALL_R < b.y + BRICK_H
        ) {
          b.alive = false;
          s.dy = -s.dy;
          s.score += 10;
          setScore(s.score);
          sounds.pop();

          if (s.bricks.every(b => !b.alive)) {
            s.running = false;
            setWon(true);
            sounds.win();
            saveScore('brick-breaker', s.score);
          }
        }
      });

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current!);
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
    };
  }, [started]);

  const restart = () => {
    start();
  };

  return (
    <GameLayout title="Brick Breaker" gameId="brick-breaker" onRestart={() => { stateRef.current.running = false; start(); }} score={score}>
      {!started && (
        <div className="text-center mb-4">
          <p className="text-muted-foreground mb-4">Move your mouse/finger to control the paddle</p>
          <button className="btn-game" onClick={start}>Start</button>
        </div>
      )}
      {(gameOver || won) && (
        <div className="text-center mb-4">
          <p className="font-display font-bold text-2xl mb-2" style={{ color: won ? 'hsl(152, 60%, 50%)' : 'hsl(0, 72%, 55%)' }}>
            {won ? '🎉 You Win!' : 'Game Over!'}
          </p>
          <button className="btn-game" onClick={restart}>Play Again</button>
        </div>
      )}
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded-2xl border border-border cursor-none touch-none"
      />
    </GameLayout>
  );
};

export default BrickBreaker;
