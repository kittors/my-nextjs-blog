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

// 辅助函数：设置 Cookie
const setCookie = (name: string, value: string, days: number) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

// 辅助函数：删除 Cookie
const deleteCookie = (name: string) => {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
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
  initialTheme: Theme; // initialTheme 在这里总是 'light' 或 'dark'
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  // `initialTheme` 来自服务器，作为客户端的初始状态
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const { defaultToSystemPreference } = appConfig.theme;

  // Effect 1: 当 theme 状态改变时，更新 <html> 的 class。
  // 这是一个核心副作用，确保 DOM 元素与 React 状态同步。
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  // Effect 2: 监听操作系统的颜色模式变化。
  // 核心修复：现在此 Effect 会根据 defaultToSystemPreference 和用户是否手动选择过主题来决定行为。
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const newSystemTheme: Theme = e.matches ? 'dark' : 'light';
      const userStoredTheme = localStorage.getItem('theme'); // 检查用户是否手动设置过主题

      if (defaultToSystemPreference) {
        // 如果配置为始终同步系统主题，则无论如何都更新
        setTheme(newSystemTheme);
        // 并且不需要在 localStorage 中存储用户选择
        deleteCookie('theme'); // 确保 cookie 也被清除
        localStorage.removeItem('theme');
      } else {
        // 如果用户没有明确选择主题 (localStorage 为空)，则跟随系统
        if (!userStoredTheme) {
          setTheme(newSystemTheme);
          // 在这种情况下，将系统偏好持久化到 localStorage
          localStorage.setItem('theme', newSystemTheme);
          setCookie('theme', newSystemTheme, 365);
        }
        // 如果用户手动选择了主题，则系统主题变化不影响当前主题
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [defaultToSystemPreference]);

  // Effect 3: 在组件挂载时，如果 `localStorage` 中没有用户明确选择的主题，
  // 则将 `initialTheme`（来自服务器）持久化到 `localStorage`。
  // 这确保了客户端主题状态与服务器渲染的初始主题保持一致，除非用户稍后手动更改。
  useEffect(() => {
    // 确保只在客户端执行
    if (typeof window !== 'undefined') {
      const userStoredTheme = localStorage.getItem('theme');

      if (defaultToSystemPreference) {
        // 如果设置为默认跟随系统，则移除任何旧的用户存储主题，并确保当前主题与系统匹配
        if (userStoredTheme) {
          localStorage.removeItem('theme');
          deleteCookie('theme');
        }
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        if (theme !== systemTheme) {
          setTheme(systemTheme);
        }
      } else {
        // 核心修正：如果 localStorage 中没有用户存储的主题，则将 initialTheme 持久化
        if (!userStoredTheme) {
          localStorage.setItem('theme', initialTheme);
          setCookie('theme', initialTheme, 365);
        } else {
          // 如果用户有存储的主题，且与当前主题不符，则更新
          // 这一步是为了处理用户在其他标签页修改了主题，导致当前页面的主题不一致的情况
          if (
            (userStoredTheme === 'light' || userStoredTheme === 'dark') &&
            theme !== userStoredTheme
          ) {
            setTheme(userStoredTheme);
          }
        }
      }
    }
  }, [initialTheme, defaultToSystemPreference, theme]);

  // 用户手动切换主题的函数
  const toggleTheme = useCallback(() => {
    // 如果配置为始终同步系统主题，则此函数不应执行任何操作。
    // ThemeToggle 组件会根据此 defaultToSystemPreference 属性决定是否渲染。
    if (defaultToSystemPreference) {
      console.warn('Cannot toggle theme: defaultToSystemPreference is true.');
      return;
    }

    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      try {
        // 将用户的手动选择（明确偏好）写入 localStorage
        localStorage.setItem('theme', newTheme);
        setCookie('theme', newTheme, 365); // 设置 cookie 同样用于服务端读取
      } catch (e) {
        console.error('无法持久化主题设置:', e);
      }
      return newTheme;
    });
  }, [defaultToSystemPreference]); // 依赖 defaultToSystemPreference

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
