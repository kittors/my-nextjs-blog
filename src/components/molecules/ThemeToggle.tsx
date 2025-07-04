// src/components/molecules/ThemeToggle.tsx
'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * ThemeToggle 组件：一个用于切换亮色和暗黑模式的按钮。
 * 此版本通过从服务器接收初始主题状态，从根本上解决了UI闪烁问题。
 *
 * 核心修正：
 * 移除了硬编码的 Tailwind hover 类，改为使用一个自定义 CSS 类 `theme-toggle-hover-effect`，
 * 该类在 `src/styles/theme.css` 中定义了基于 CSS 变量的悬停背景色，
 * 确保悬停样式能够正确响应当前主题。
 */
const ThemeToggle: React.FC = () => {
  // 'theme' 状态现在从初始服务器渲染开始就已经是可靠的。
  const { toggleTheme, defaultToSystemPreference, theme } = useTheme();

  // 如果配置为始终同步系统主题，则不渲染此切换按钮。
  if (defaultToSystemPreference) {
    return null;
  }

  // 统一定义按钮的样式和尺寸。
  // 核心修正：移除 hover:bg-neutral-200 dark:hover:bg-neutral-700
  const buttonClasses = `p-2 rounded-full text-foreground transition-colors duration-200
                       cursor-pointer flex items-center justify-center
                       theme-toggle-hover-effect`; // 新增自定义的 hover 效果类
  const buttonStyle = { width: '36px', height: '36px' };

  return (
    <button
      onClick={toggleTheme}
      className={buttonClasses}
      style={buttonStyle}
      aria-label="切换主题"
      title="切换主题"
    >
      {/* 因为服务器现在渲染了正确的主题，所以不再存在不匹配或闪烁。
        我们直接根据可靠的 'theme' 状态来决定显示哪个图标。
      */}
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;
