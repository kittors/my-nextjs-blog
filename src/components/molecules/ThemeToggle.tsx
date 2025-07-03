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
  const { toggleTheme, defaultToSystemPreference } = useTheme(); // 获取 defaultToSystemPreference

  // 根据 defaultToSystemPreference 决定按钮是否禁用
  const isDisabled = defaultToSystemPreference;

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-full text-foreground transition-colors duration-200
                 hover:bg-neutral-200 /* 亮色模式下的 hover 背景 */
                 theme-toggle-hover-effect /* 核心优化：自定义类处理暗色模式下的 hover 背景 */
                 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label="切换主题"
      disabled={isDisabled} // 设置 disabled 属性
      title={isDisabled ? '已配置为同步系统主题，无法手动切换' : '切换主题'} // 添加提示
    >
      <Moon size={20} className="block dark:hidden text-neutral-700 hover:text-primary" />
      <Sun size={20} className="hidden dark:block text-primary-light hover:text-primary" />
    </button>
  );
};

export default ThemeToggle;
