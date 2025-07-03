// src/contexts/ThemeContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { appConfig } from '@/lib/config';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isThemeInitialized: boolean;
  enableManualToggle: boolean;
  defaultToSystemPreference: boolean; // 暴露 defaultToSystemPreference 给消费者
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light');
  const [isThemeInitialized, setIsThemeInitialized] = useState(false);

  const { defaultToSystemPreference, initialTheme, enableManualToggle } = appConfig.theme;

  // 这个函数负责处理系统主题变化时的逻辑
  const handleChange = useCallback(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const newSystemTheme: Theme = mediaQuery.matches ? 'dark' : 'light';

    // 如果当前 React 状态的主题已经与新的系统主题一致，则无需更新，避免不必要的重渲染
    if (theme === newSystemTheme) {
      return;
    }

    // 核心逻辑：当系统主题变化时，如果配置为默认跟随系统，则直接更新主题
    if (defaultToSystemPreference) {
      setTheme(newSystemTheme);
      // 如果允许手动切换，则同时更新 localStorage，使系统主题成为新的“手动偏好”
      if (enableManualToggle) {
        try {
          localStorage.setItem('theme', newSystemTheme);
        } catch (e) {
          console.error('ThemeContext: Could not save system theme change to localStorage.', e);
        }
      }
    } else {
      // 如果不默认跟随系统，且用户有手动设置的主题，则不自动更新
      let storedTheme: string | null = null;
      try {
        storedTheme = window.localStorage.getItem('theme');
        if (storedTheme !== 'light' && storedTheme !== 'dark') {
          storedTheme = null;
        }
      } catch (e) {
        console.error(
          'ThemeContext: Error accessing localStorage on system theme change (defaultToSystemPreference is false):',
          e
        );
        storedTheme = null;
      }

      // 只有在不允许手动切换或没有存储主题时，才跟随 initialTheme 逻辑
      if (!enableManualToggle || !storedTheme) {
        if (initialTheme === 'system') {
          setTheme(newSystemTheme); // 如果 initialTheme 是 'system'，则也跟随系统
        }
      }
    }
  }, [theme, defaultToSystemPreference, enableManualToggle, initialTheme]); // 确保所有依赖项都包含在内

  // Effect 1: 初始化主题 (客户端水合后执行)
  // 这个 Effect 在组件挂载时运行一次，用于确定初始主题
  useEffect(() => {
    let resolvedTheme: Theme;
    let storedTheme: string | null = null;

    try {
      storedTheme = window.localStorage.getItem('theme');
      if (storedTheme !== 'light' && storedTheme !== 'dark') {
        storedTheme = null;
      }
    } catch (e) {
      console.error('ThemeContext: Error accessing localStorage for initial theme:', e);
      storedTheme = null;
    }

    // 初始化的优先级：
    // 1. 如果允许手动切换且 localStorage 有值，则 localStorage 优先
    // 2. 否则，如果配置为默认跟随系统，则使用系统主题
    // 3. 否则，使用配置的 initialTheme (如果 initialTheme 是 'system' 也按系统偏好处理)
    if (enableManualToggle && storedTheme) {
      resolvedTheme = storedTheme as Theme;
    } else if (defaultToSystemPreference) {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      if (initialTheme === 'system') {
        resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      } else {
        resolvedTheme = initialTheme as Theme;
      }
    }

    setTheme(resolvedTheme);
    setIsThemeInitialized(true);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(resolvedTheme);
  }, [defaultToSystemPreference, initialTheme, enableManualToggle]); // 依赖这些配置项

  // Effect 2: 监听系统主题变化
  // 这个 Effect 负责注册和清理系统主题偏好变化的事件监听器
  useEffect(() => {
    // 如果配置不允许默认同步系统主题，则不设置监听器
    if (!defaultToSystemPreference) {
      return;
    }

    // 检查 window.matchMedia 是否可用 (客户端环境)
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // 将顶层定义的 handleChange 函数作为事件监听器
    mediaQuery.addEventListener('change', handleChange);

    // 清理函数：在组件卸载或依赖项变化时移除事件监听器
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [defaultToSystemPreference, handleChange]); // useEffect 的依赖项：defaultToSystemPreference 和 handleChange (确保监听器在 handleChange 变化时重新注册)

  // Effect 3: 在 theme 状态变化时更新 localStorage 和 HTML 类
  // 这个 Effect 负责将 React 状态中的主题同步到 DOM 和 localStorage
  useEffect(() => {
    // 确保在主题提供者完全初始化后才执行此逻辑
    if (!isThemeInitialized) {
      return;
    }

    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);

    try {
      // 如果允许手动切换，则将当前主题保存到 localStorage
      // 这里的逻辑与 handleChange 中的 localStorage 更新保持一致
      if (enableManualToggle) {
        localStorage.setItem('theme', theme);
      } else {
        // 如果不允许手动切换，则清除 localStorage 中的主题，确保完全由配置和系统控制
        localStorage.removeItem('theme');
      }
    } catch (e) {
      console.error('ThemeContext: Could not save theme to localStorage.', e);
    }
  }, [theme, isThemeInitialized, enableManualToggle]); // 依赖项：theme 状态、初始化状态和手动切换配置

  // toggleTheme 函数：用于用户手动切换主题
  const toggleTheme = () => {
    // 如果配置为默认同步系统主题，则不允许手动切换
    if (defaultToSystemPreference) {
      console.warn('手动主题切换已禁用，因为已配置为同步系统主题。');
      return;
    }
    // 如果不允许手动切换（通过 enableManualToggle 配置），也禁用
    if (!enableManualToggle) {
      console.warn('手动主题切换已禁用。');
      return;
    }

    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // 用户手动切换主题时，也将其保存到 localStorage
      try {
        localStorage.setItem('theme', newTheme);
      } catch (e) {
        console.error('ThemeContext: Could not save manual toggle to localStorage.', e);
      }
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isThemeInitialized,
        enableManualToggle,
        defaultToSystemPreference,
      }}
    >
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
