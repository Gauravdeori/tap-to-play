import { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '@/components/GameLayout';
import { sounds } from '@/lib/sounds';
import { saveScore } from '@/lib/scores';
import { motion } from 'framer-motion';

const WORDS = [
  'apple','brave','cloud','dream','eagle','flame','grape','heart','ivory','jolly',
  'kneel','lemon','magic','noble','ocean','peace','queen','river','storm','tiger',
  'ultra','vivid','waltz','xenon','yacht','zebra','blaze','craft','dance','frost',
  'globe','hover','index','joker','kayak','lunar','mango','nerve','orbit','prism',
  'quilt','radar','solar','tempo','unity','vault','widow','pixel','yield','zonal'
];

const GAME_DURATION = 30;

const TypingSpeed = () => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentWord, setCurrentWord] = useState('');
  const [input, setInput] = useState('');
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [wordsTyped, setWordsTyped] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const nextWord = useCallback(() => {
    setCurrentWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setInput('');
  }, []);

  const startGame = () => {
    setScore(0);
    setWordsTyped(0);
    setTimeLeft(GAME_DURATION);
    setGameActive(true);
    setGameOver(false);
    nextWord();
    sounds.click();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (!gameActive) return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameActive(false);
          setGameOver(true);
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameActive]);

  useEffect(() => {
    if (gameOver && wordsTyped > 0) {
      const wpm = Math.round((wordsTyped / GAME_DURATION) * 60);
      saveScore('typing-speed', wpm);
      sounds.gameOver();
    }
  }, [gameOver, wordsTyped]);

  const handleInput = (val: string) => {
    if (!gameActive) return;
    setInput(val);
    if (val.trim().toLowerCase() === currentWord) {
      sounds.match();
      setScore(s => s + 1);
      setWordsTyped(w => w + 1);
      nextWord();
    }
  };

  const wpm = gameActive ? Math.round((wordsTyped / Math.max(1, GAME_DURATION - timeLeft)) * 60) : Math.round((wordsTyped / GAME_DURATION) * 60);

  const restart = () => {
    setGameActive(false);
    setGameOver(false);
    setScore(0);
    setWordsTyped(0);
    setTimeLeft(GAME_DURATION);
    setInput('');
  };

  return (
    <GameLayout title="Typing Speed" gameId="typing-speed" onRestart={restart} score={wpm} showScore={gameActive || gameOver}>
      <div className="w-full max-w-md mx-auto text-center">
        {!gameActive && !gameOver && (
          <div>
            <p className="text-muted-foreground mb-4">Type the words as fast as you can!</p>
            <button onClick={startGame} className="btn-game text-lg">Start Typing!</button>
          </div>
        )}
        {gameActive && (
          <div>
            <div className="flex justify-between mb-4 text-sm text-muted-foreground">
              <span>Time: <span className="text-foreground font-bold">{timeLeft}s</span></span>
              <span>WPM: <span className="text-foreground font-bold">{wpm}</span></span>
              <span>Words: <span className="text-foreground font-bold">{wordsTyped}</span></span>
            </div>
            <motion.div
              key={currentWord}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-display font-extrabold text-foreground mb-6 py-6 bg-card rounded-2xl border border-border"
            >
              {currentWord.split('').map((char, i) => (
                <span
                  key={i}
                  className={i < input.length ? (input[i] === char ? 'text-green-400' : 'text-destructive') : 'text-foreground'}
                >
                  {char}
                </span>
              ))}
            </motion.div>
            <input
              ref={inputRef}
              value={input}
              onChange={e => handleInput(e.target.value)}
              className="w-full rounded-xl border border-border bg-secondary px-4 py-3 text-center text-lg font-body text-foreground outline-none focus:ring-2 focus:ring-primary"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
        )}
        {gameOver && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
            <p className="text-2xl font-display font-bold text-foreground mb-2">Time's Up!</p>
            <p className="text-muted-foreground mb-1">Words typed: <span className="text-accent font-bold">{wordsTyped}</span></p>
            <p className="text-muted-foreground mb-4">Speed: <span className="text-accent font-bold">{wpm} WPM</span></p>
            <button onClick={startGame} className="btn-game">Play Again</button>
          </motion.div>
        )}
      </div>
    </GameLayout>
  );
};

export default TypingSpeed;
