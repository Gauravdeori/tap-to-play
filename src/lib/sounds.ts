const audioCtx = () => {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
};

let ctx: AudioContext | null = null;
const getCtx = () => {
  if (!ctx) ctx = audioCtx();
  return ctx;
};

const play = (freq: number, duration: number, type: OscillatorType = 'sine', vol = 0.15) => {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + duration);
  } catch {}
};

export const sounds = {
  click: () => play(600, 0.08, 'sine', 0.1),
  win: () => {
    play(523, 0.15); 
    setTimeout(() => play(659, 0.15), 100);
    setTimeout(() => play(784, 0.3), 200);
  },
  lose: () => {
    play(400, 0.15, 'sawtooth', 0.1);
    setTimeout(() => play(300, 0.3, 'sawtooth', 0.1), 150);
  },
  pop: () => play(800, 0.06, 'sine', 0.08),
  match: () => {
    play(880, 0.1);
    setTimeout(() => play(1100, 0.15), 80);
  },
  tick: () => play(1000, 0.03, 'square', 0.05),
  gameOver: () => {
    play(500, 0.2, 'sawtooth', 0.12);
    setTimeout(() => play(400, 0.2, 'sawtooth', 0.12), 200);
    setTimeout(() => play(300, 0.4, 'sawtooth', 0.12), 400);
  },
  levelUp: () => {
    play(600, 0.1);
    setTimeout(() => play(800, 0.1), 100);
    setTimeout(() => play(1000, 0.2), 200);
  },
};
