// src/components/atoms/ThemeScript.tsx
import React from 'react';
import { appConfig } from '@/lib/config';

/**
 * ThemeScript 组件：注入一个阻塞渲染的脚本，以在客户端渲染前设置正确的主题，从而防止主题闪烁 (FOUC)。
 *
 * 架构洞察：
 * 这是解决水合作用 (Hydration) 错误和主题闪烁的最终方案。
 * - **单一权威**: 此脚本是设置初始 `<html>` `className` 的唯一和最终权威。服务器不再尝试渲染这个 `className`。
 * - **执行时机**: 作为内联脚本放置在 `<head>` 中，它会在浏览器解析 `<body>` 之前同步执行，确保在任何内容可见之前，主题就已正确应用。
 * - **逻辑优先级**: 脚本严格遵循以下优先级来确定主题，这与 ThemeProvider 中的逻辑相匹配：
 * 1. `localStorage` 中的用户显式选择 (`'theme'`)。
 * 2. 如果 `appConfig.theme.defaultToSystemPreference` 为 `true`，则直接使用系统偏好。
 * 3. 如果 `localStorage` 中无设置，则回退到系统偏好设置。
 * - **错误处理**: 包含 `try...catch` 块，以确保在任何意外情况（如 `localStorage` 访问被禁用）下，页面都能安全地回退到一个默认主题（light）。
 */
const ThemeScript = () => {
  const { defaultToSystemPreference, initialTheme } = appConfig.theme;

  const script = `
    (function() {
      try {
        const getInitialTheme = () => {
          let storedTheme;
          try {
            // 1. 尝试从 localStorage 获取用户明确存储的主题偏好
            storedTheme = window.localStorage.getItem('theme');
          } catch (e) {
            console.error('ThemeScript: 无法访问 localStorage，回退到系统偏好或默认主题。', e);
          }

          // 2. 如果 localStorage 中存在有效主题，则使用它
          if (storedTheme === 'light' || storedTheme === 'dark') {
            return storedTheme;
          }
          
          // 3. 检查 appConfig 是否配置为默认同步系统主题
          if (${defaultToSystemPreference}) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }

          // 4. 如果 appConfig initialTheme 是 'system'，则回退到系统偏好
          if ('${initialTheme}' === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          
          // 5. 否则，使用 appConfig 中定义的初始主题
          return '${initialTheme}';
        };

        const theme = getInitialTheme();
        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
      } catch (e) {
        // 在任何意外错误发生时，提供一个最终的安全回退
        console.error('ThemeScript: 应用初始主题时出错:', e);
        document.documentElement.classList.add('light'); // 安全回退到亮色主题
      }
    })();
  `;

  // 使用 dangerouslySetInnerHTML 将脚本作为字符串注入
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};

export default ThemeScript;
