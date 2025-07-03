// src/components/atoms/ThemeScript.tsx
import React from 'react';

/**
 * ThemeScript 组件：注入一个脚本以防止主题闪烁 (FOUC)。
 * 这个脚本会在主 React 应用“水合”之前运行，根据 localStorage 或系统偏好
 * 在 <html> 元素上设置初始主题类。
 * 这是在服务器渲染应用中实现流畅用户体验的关键部分。
 */
const ThemeScript = () => {
  const script = `
    (function() {
      function getInitialTheme() {
        // 1. 优先检查 localStorage 中存储的主题
        try {
          const storedTheme = window.localStorage.getItem('theme');
          if (typeof storedTheme === 'string' && (storedTheme === 'light' || storedTheme === 'dark')) {
            return storedTheme;
          }
        } catch (e) {
          // localStorage 可能因安全设置被禁用
          console.error('Could not access localStorage for theme setting.', e);
        }

        // 2. 如果 localStorage 中没有，则检查用户的系统偏好
        const systemMedia = window.matchMedia('(prefers-color-scheme: dark)');
        if (systemMedia.matches) {
          return 'dark';
        }

        // 3. 默认返回 'light'
        return 'light';
      }

      const theme = getInitialTheme();
      const root = document.documentElement;
      // 在<html>标签上直接添加 'dark' 或 'light' 类
      root.classList.add(theme);
    })();
  `;

  return (
    // 使用 dangerouslySetInnerHTML 来渲染内联脚本
    <script dangerouslySetInnerHTML={{ __html: script }} />
  );
};

export default ThemeScript;
