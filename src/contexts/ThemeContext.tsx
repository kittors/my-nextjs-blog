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

/**
 * 设置一个客户端 cookie。
 * @param name cookie 的名称。
 * @param value cookie 的值。
 * @param days cookie 的有效期（天）。
 */
const setCookie = (name: string, value: string, days: number) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  }
  // 确保在整个站点内生效
  document.cookie = name + '=' + (value || '') + expires + '; path=/';
};

type Theme = 'light' | 'dark';

// 核心修正 1: 在类型定义中添加 defaultToSystemPreference
interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  defaultToSystemPreference: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  // 从服务器（通过读取cookie）接收初始主题
  initialTheme: Theme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme }) => {
  // 使用从服务器传递过来的 initialTheme 初始化状态，确保了SSR和客户端的一致性。
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const { defaultToSystemPreference } = appConfig.theme;

  // 当主题状态改变时，更新 <html> 的 class 以应用CSS变量。
  // 这个 effect 只在客户端运行。
  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    if (defaultToSystemPreference) {
      console.warn('手动主题切换已禁用，因为已配置为同步系统主题。');
      return;
    }

    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';

      // 当用户切换主题时，设置一个cookie。
      // 这个cookie将在下次页面加载时被服务器读取。
      setCookie('theme', newTheme, 365);

      // 同时，仍然更新 localStorage，这是为了让 ThemeScript 能在页面跳转时立即生效，防止FOUC。
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        console.error('无法在 localStorage 中设置主题', e);
      }

      return newTheme;
    });
  }, [defaultToSystemPreference]);

  // 核心修正 2: 将 defaultToSystemPreference 添加到 context 的 value 中
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
