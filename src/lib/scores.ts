export interface ScoreEntry {
  game: string;
  score: number;
  date: string;
  player?: string;
}

const SCORES_KEY = 'tapplay-scores';

export const getScores = (): ScoreEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(SCORES_KEY) || '[]');
  } catch {
    return [];
  }
};

export const saveScore = (game: string, score: number, player = 'Player') => {
  const scores = getScores();
  scores.push({ game, score, date: new Date().toISOString(), player });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem(SCORES_KEY, JSON.stringify(scores.slice(0, 100)));
};

export const getHighScore = (game: string): number => {
  const scores = getScores().filter(s => s.game === game);
  return scores.length > 0 ? scores[0].score : 0;
};

export const getTopScores = (game?: string, limit = 10): ScoreEntry[] => {
  const scores = getScores();
  const filtered = game ? scores.filter(s => s.game === game) : scores;
  return filtered.slice(0, limit);
};
