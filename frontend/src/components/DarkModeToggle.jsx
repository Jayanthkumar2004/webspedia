import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import '../styles/darkmode.css';

export default function DarkModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-toggle">
      <button
        className={theme === 'light' ? 'active' : ''}
        onClick={() => setTheme('light')}
        title="Light Mode"
        type="button"
      >
        <Sun size={15} />
        <span>Light</span>
      </button>

      <button
        className={theme === 'dark' ? 'active' : ''}
        onClick={() => setTheme('dark')}
        title="Black Mode"
        type="button"
      >
        <Moon size={15} />
        <span>Black</span>
      </button>
    </div>
  );
}