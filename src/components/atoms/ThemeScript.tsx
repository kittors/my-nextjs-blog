// src/components/atoms/ThemeScript.tsx
import React from 'react';
import { appConfig } from '@/lib/config';

/**
 * ThemeScript 组件：注入一个脚本以防止主题闪烁 (FOUC)。
 *
 * 核心逻辑：
 * 此脚本在客户端渲染前执行，根据 `appConfig` 的设置和用户的本地存储，
 * 为 `<html>` 元素设置正确的主题类，确保初始加载时主题的正确性。
 * 它严格遵循“主题切换逻辑最终版计划”中定义的优先级。
 */
const ThemeScript = () => {
  const { defaultToSystemPreference } = appConfig.theme;

  const script = `
    (function() {
      try {
        const isSystemSyncEnabled = ${defaultToSystemPreference};
        let theme;

        if (isSystemSyncEnabled) {
          // 模式一：完全同步模式。直接匹配系统设置。
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          // 模式二：混合优先模式。
          let storedTheme = null;
          try {
            // 优先从 localStorage 获取用户的“临时偏好”。
            storedTheme = window.localStorage.getItem('theme');
          } catch (e) {
            console.error('无法访问 localStorage:', e);
          }

          if (storedTheme === 'light' || storedTheme === 'dark') {
            // 如果存在有效的用户偏好，则使用它。
            theme = storedTheme;
          } else {
            // 否则，回退到同步系统主题作为初始状态。
            theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
        }

        const root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
      } catch (e) {
        // 发生任何错误时的最终回退方案。
        document.documentElement.classList.add('light');
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};

export default ThemeScript;
