import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

const THEME_KEY = 'tapplay-theme';

const ThemeToggle = () => {
  const [light, setLight] = useState(() => {
    return localStorage.getItem(THEME_KEY) === 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('light', light);
    localStorage.setItem(THEME_KEY, light ? 'light' : 'dark');
  }, [light]);

  return (
    <div className="flex items-center gap-2">
      <Moon className="w-4 h-4 text-muted-foreground" />
      <Switch checked={light} onCheckedChange={setLight} />
      <Sun className="w-4 h-4 text-muted-foreground" />
    </div>
  );
};

export default ThemeToggle;
