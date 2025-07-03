// src/components/atoms/ThemeScript.tsx
import React from 'react';
import { appConfig } from '@/lib/config'; // 导入 appConfig

/**
 * ThemeScript 组件：注入一个脚本以防止主题闪烁 (FOUC)。
 * 这个脚本会在主 React 应用“水合”之前运行，根据 localStorage、系统偏好
 * 和配置在 <html> 元素上设置初始主题类。
 * 这是在服务器渲染应用中实现流畅用户体验的关键部分。
 */
const ThemeScript = () => {
  // 从配置中获取主题相关设置
  const { defaultToSystemPreference, initialTheme, enableManualToggle } = appConfig.theme;

  const script = `
    (function() {
      try {
        const defaultToSystem = ${defaultToSystemPreference};
        const enableManual = ${enableManualToggle};
        const configuredInitialTheme = '${initialTheme}';

        let resolvedTheme;
        let storedTheme = null;

        try {
          storedTheme = window.localStorage.getItem('theme');
          // 验证 storedTheme 的有效性
          if (storedTheme !== 'light' && storedTheme !== 'dark') {
            storedTheme = null; // 无效则视为不存在
          }
        } catch (e) {
          // Error accessing localStorage, proceed without it
          storedTheme = null;
        }

        // 核心逻辑：
        if (defaultToSystem) {
          // 如果配置为默认跟随系统，则优先使用系统主题
          resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else if (enableManual && storedTheme) {
          // 如果不默认跟随系统，但允许手动切换且 localStorage 有值，则使用 localStorage
          resolvedTheme = storedTheme;
        } else {
          // 否则，使用配置的 initialTheme (如果 initialTheme 是 'system' 也按系统偏好处理)
          if (configuredInitialTheme === 'system') {
             resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          } else {
             resolvedTheme = configuredInitialTheme;
          }
        }

        const root = document.documentElement;
        // 确保移除旧类，添加新类，实现原子性更新
        root.classList.remove('light', 'dark');
        root.classList.add(resolvedTheme);
      } catch (e) {
        // Fallback: if any error occurs, default to light theme
        document.documentElement.classList.add('light');
      }
    })();
  `;

  return (
    // 使用 dangerouslySetInnerHTML 来渲染内联脚本
    <script dangerouslySetInnerHTML={{ __html: script }} />
  );
};

export default ThemeScript;
