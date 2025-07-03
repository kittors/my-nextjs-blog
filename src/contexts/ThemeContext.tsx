// src/contexts/ThemeContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

// 在这里添加 isThemeInitialized
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isThemeInitialized: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isThemeInitialized, setIsThemeInitialized] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const initialThemeIsDark = root.classList.contains('dark');
    setTheme(initialThemeIsDark ? 'dark' : 'light');
    setIsThemeInitialized(true);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  useEffect(() => {
    if (!isThemeInitialized) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error('Could not save theme to localStorage.', e);
    }
  }, [theme, isThemeInitialized]);

  return (
    // 在这里提供 isThemeInitialized
    <ThemeContext.Provider value={{ theme, toggleTheme, isThemeInitialized }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
