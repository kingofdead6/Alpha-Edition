import { createContext, useContext, useLayoutEffect, useState } from 'react';

const ThemeContext = createContext(null);
const MODES = ['system', 'light', 'dark'];

function initial() {
  try {
    const v = localStorage.getItem('alfa-theme');
    if (MODES.includes(v)) return v;
  } catch {
    /* storage blocked */
  }
  return 'system';
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(initial);

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (mode === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', mode);
    try {
      localStorage.setItem('alfa-theme', mode);
    } catch {
      /* storage blocked */
    }
  }, [mode]);

  const cycle = () => setMode((m) => MODES[(MODES.indexOf(m) + 1) % MODES.length]);
  return <ThemeContext.Provider value={{ mode, setMode, cycle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
