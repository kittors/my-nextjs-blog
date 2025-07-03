'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * ThemeToggle 组件：一个用于切换亮色和暗黑模式的按钮。
 * 通过纯 CSS 控制图标显隐，以实现刷新页面时无缝、无闪烁的视觉效果。
 */
const ThemeToggle: React.FC = () => {
  // 我们仍然需要 useTheme 来触发主题切换的逻辑。
  // 但不再需要 isThemeInitialized 来控制渲染。
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-foreground transition-colors duration-200
                 hover:bg-neutral-200 dark:hover:bg-neutral-700"
      aria-label="切换主题"
    >
      {/* 核心改动：同时渲染两个图标，并使用 Tailwind 的 dark: 变体来控制它们的显示。
        - 月亮图标：在亮色模式下显示 (block)，在暗色模式下隐藏 (dark:hidden)。
        - 太阳图标：在亮色模式下隐藏 (hidden)，在暗色模式下显示 (dark:block)。
        这个切换完全由 CSS 处理，因此不会有任何由 JavaScript 加载延迟引起的闪烁。
      */}
      <Moon size={20} className="block dark:hidden text-neutral-700 hover:text-primary" />
      <Sun size={20} className="hidden dark:block text-primary-light hover:text-primary" />
    </button>
  );
};

export default ThemeToggle;
