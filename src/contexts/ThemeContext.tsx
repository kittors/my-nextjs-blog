"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  // 新增：isMounted，用于表示组件是否已在客户端挂载并完成主题初始化
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // 关键修正：服务器端和客户端初始渲染时，都强制使用 'light'
  // 然后在 useEffect 中才根据实际用户偏好进行更新
  const [theme, setThemeState] = useState<Theme>('light');
  const [isMounted, setIsMounted] = useState(false); // 新增状态，表示组件是否已在客户端挂载

  useEffect(() => {
    // 这个 useEffect 只在客户端运行
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // 确定最终的主题
    const initialTheme: Theme = (storedTheme === 'light' || storedTheme === 'dark')
      ? storedTheme
      : (systemPrefersDark ? 'dark' : 'light');

    setThemeState(initialTheme); // 更新主题状态
    setIsMounted(true); // 标记组件已挂载

    // 更新 <html> 元素上的 class
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(initialTheme);
    localStorage.setItem('theme', initialTheme);

    // 监听主题变化，并更新 HTML 的 class 和 localStorage
    // 这里的监听器逻辑与之前相同，确保后续切换时也更新
    // ...
  }, []); // 空依赖数组，只在组件首次挂载时运行一次

  // 确保当 themeState 变化时，html class 和 localStorage 持续更新
  useEffect(() => {
    if (isMounted) { // 只有在客户端完全挂载后才执行后续主题更新
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, isMounted]);


  const toggleTheme = () => {
    setThemeState((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isMounted }}>
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