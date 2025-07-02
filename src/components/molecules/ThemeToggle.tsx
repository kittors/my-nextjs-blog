"use client"; // This is a client component

import React from 'react';
import { Sun, Moon } from 'lucide-react'; // Import Sun and Moon icons
import { useTheme } from '@/contexts/ThemeContext'; // Import useTheme Hook

/**
 * ThemeToggle Component: A button to switch between light and dark modes.
 * Following atomic design principles, this is a molecule component containing icons and interactive logic.
 */
const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-foreground transition-colors duration-200
                 hover:bg-neutral-200 dark:hover:bg-neutral-700" // Added dark mode hover effect
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <Moon size={20} className="text-neutral-700 hover:text-primary" /> // Moon icon for light mode
      ) : (
        <Sun size={20} className="text-primary-light hover:text-primary" /> // Sun icon for dark mode
      )}
    </button>
  );
};

export default ThemeToggle;