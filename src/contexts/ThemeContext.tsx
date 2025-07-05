// src/contexts/ThemeContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { appConfig } from '@/lib/config';

const setCookie = (name: string, value: string, days: number) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  defaultToSystemPreference: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const { defaultToSystemPreference } = appConfig.theme;

  // Effect 1: 当 theme 状态改变时，更新 <html> 的 class。
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // 核心新增 Effect 2: 监听操作系统的颜色模式变化。
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme: Theme = e.matches ? 'dark' : 'light';

      // 无论在哪种模式下，系统主题的变化都应该立即被响应。
      setTheme(newSystemTheme);

      // 在混合模式下，系统变化会重置用户的临时选择。
      if (!defaultToSystemPreference) {
        try {
          localStorage.removeItem('theme');
          setCookie('theme', '', -1); // 设置一个过期的 cookie 来删除它
        } catch (error) {
          console.error('无法清除主题存储:', error);
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    // 组件卸载时清理监听器。
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [defaultToSystemPreference]);

  // 用户手动切换主题的函数
  const toggleTheme = useCallback(() => {
    if (defaultToSystemPreference) return; // 在完全同步模式下，此函数不应执行。

    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      try {
        // 将用户的手动选择（临时偏好）写入存储。
        localStorage.setItem('theme', newTheme);
        setCookie('theme', newTheme, 365);
      } catch (e) {
        console.error('无法持久化主题设置:', e);
      }
      return newTheme;
    });
  }, [defaultToSystemPreference]);

  const contextValue = useMemo(
    () => ({ theme, toggleTheme, defaultToSystemPreference }),
    [theme, toggleTheme, defaultToSystemPreference]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
