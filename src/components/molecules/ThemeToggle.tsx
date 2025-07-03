'use client';

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * ThemeToggle 组件：一个用于切换亮色和暗黑模式的按钮。
 * 通过纯 CSS 控制图标显隐，以实现刷新页面时无缝、无闪烁的视觉效果。
 */
const ThemeToggle: React.FC = () => {
  // 获取主题切换逻辑、defaultToSystemPreference 和当前主题
  const { toggleTheme, defaultToSystemPreference, theme } = useTheme(); // <-- 获取 'theme' 状态

  // 如果 defaultToSystemPreference 为 true，则禁用按钮
  const isDisabled = defaultToSystemPreference;

  // 如果配置为始终同步系统主题，则不渲染切换按钮
  if (defaultToSystemPreference) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      // 核心优化：添加 cursor-pointer 类，确保鼠标悬停时显示指针
      className={`p-2 rounded-full text-foreground transition-colors duration-200
                 hover:bg-neutral-200 /* 亮色模式下的 hover 背景 */
                 theme-toggle-hover-effect /* 自定义类处理暗色模式下的 hover 背景 */
                 ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      aria-label="切换主题"
      disabled={isDisabled} // 设置 disabled 属性
      title={isDisabled ? '已配置为同步系统主题，无法手动切换' : '切换主题'} // 添加提示
    >
      {/* 核心修复：根据 React 的 theme 状态直接条件渲染图标 */}
      {theme === 'light' ? (
        // 亮色模式下显示月亮图标
        <Moon
          size={20}
          className="text-[var(--toggle-icon-light-color)] hover:text-[var(--toggle-icon-light-hover-color)]"
        />
      ) : (
        // 暗色模式下显示太阳图标
        <Sun
          size={20}
          className="text-[var(--toggle-icon-dark-color)] hover:text-[var(--toggle-icon-dark-hover-color)]"
        />
      )}
    </button>
  );
};

export default ThemeToggle;
