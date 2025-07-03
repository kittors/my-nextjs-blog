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

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isThemeInitialized: boolean;
  defaultToSystemPreference: boolean; // 暴露 defaultToSystemPreference 给消费者
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isThemeInitialized, setIsThemeInitialized] = useState(false);

  // 从配置中获取主题相关设置 (enableManualToggle 已移除)
  const { defaultToSystemPreference, initialTheme } = appConfig.theme;

  // 这个函数负责处理系统主题变化时的逻辑
  const handleChange = useCallback(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const newSystemTheme: Theme = mediaQuery.matches ? 'dark' : 'light';

    // 如果当前 React 状态的主题已经与新的系统主题一致，则无需更新
    if (theme === newSystemTheme) {
      return;
    }

    // 核心逻辑：
    if (defaultToSystemPreference) {
      // 如果配置为默认跟随系统 (true)，则始终更新为新的系统主题
      setTheme(newSystemTheme);
      // 同时更新 localStorage，使系统主题成为新的“手动偏好”（如果以后 defaultToSystemPreference 变为 false）
      try {
        localStorage.setItem('theme', newSystemTheme);
      } catch (e) {
        console.error('ThemeContext: Could not save system theme change to localStorage.', e);
      }
    } else {
      // 如果不默认跟随系统 (false)，但系统主题变化时，也强制更新为新的系统主题
      setTheme(newSystemTheme);
      try {
        // 将此新的系统主题保存到 localStorage，作为当前的手动偏好
        localStorage.setItem('theme', newSystemTheme);
      } catch (e) {
        console.error('ThemeContext: Could not save system-synced theme to localStorage.', e);
      }
    }
  }, [theme, defaultToSystemPreference]); // useCallback 的依赖项

  // Effect 1: 初始化主题 (客户端水合后执行)
  useEffect(() => {
    let resolvedTheme: Theme;
    let storedTheme: string | null = null;

    try {
      // 只有在 defaultToSystemPreference 为 false 时才尝试读取 localStorage
      if (!defaultToSystemPreference) {
        storedTheme = window.localStorage.getItem('theme');
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
          storedTheme = null;
        }
      }
    } catch (e) {
      console.error('ThemeContext: Error accessing localStorage for initial theme:', e);
      storedTheme = null;
    }

    // 初始化的优先级：
    if (defaultToSystemPreference) {
      // 如果配置为默认跟随系统，则始终使用系统主题
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      // 如果不默认跟随系统 (即允许手动切换)
      if (storedTheme) {
        // 如果 localStorage 中有手动设置，则使用它
        resolvedTheme = storedTheme as Theme;
      } else {
        // 否则，默认跟随系统主题 (即使不强制同步，初始也应友好地跟随系统)
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }
    }

    setTheme(resolvedTheme);
    setIsThemeInitialized(true);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [defaultToSystemPreference, initialTheme]); // 依赖项更新：移除了 enableManualToggle

  // Effect 2: 监听系统主题变化
  useEffect(() => {
    // 检查 window.matchMedia 是否可用 (客户端环境)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [handleChange]); // 依赖项更新：只依赖 handleChange

  // Effect 3: 在 theme 状态变化时更新 HTML 类
  useEffect(() => {
    if (!isThemeInitialized) {
      return;
    }

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);

    // 注意：localStorage 的写入逻辑已移至 handleChange 和 toggleTheme
    // 这里不再直接操作 localStorage，避免重复写入或冲突
  }, [theme, isThemeInitialized]); // 依赖项更新：移除了 enableManualToggle

  // toggleTheme 函数：用于用户手动切换主题
  const toggleTheme = useCallback(() => {
    // 如果配置为默认同步系统主题，则不允许手动切换
    if (defaultToSystemPreference) {
      console.warn('手动主题切换已禁用，因为已配置为同步系统主题。');
      return;
    }

    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // 用户手动切换主题时，将其保存到 localStorage
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        console.error('ThemeContext: Could not save manual toggle to localStorage.', e);
      }
      return newTheme;
    });
  }, [defaultToSystemPreference]);

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme,
      isThemeInitialized,
      defaultToSystemPreference,
    }),
    [theme, toggleTheme, isThemeInitialized, defaultToSystemPreference]
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
