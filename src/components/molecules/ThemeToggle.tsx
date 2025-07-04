// src/components/molecules/ThemeToggle.tsx
'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * ThemeToggle 组件：一个用于切换亮色和暗黑模式的按钮。
 * 此版本通过从服务器接收初始主题状态，从根本上解决了UI闪烁问题。
 */
const ThemeToggle: React.FC = () => {
  // 'theme' 状态现在从初始服务器渲染开始就已经是可靠的。
  const { toggleTheme, defaultToSystemPreference, theme } = useTheme();

  // 如果配置为始终同步系统主题，则不渲染此切换按钮。
  if (defaultToSystemPreference) {
    return null;
  }

  // 统一定义按钮的样式和尺寸。
  const buttonClasses = `p-2 rounded-full text-foreground transition-colors duration-200
                       hover:bg-neutral-200
                       dark:hover:bg-neutral-700
                       cursor-pointer flex items-center justify-center`;
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
