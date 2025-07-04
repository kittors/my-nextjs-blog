// src/hooks/useIsMobile.ts
'use client';

import { useState, useEffect } from 'react';

/**
 * 一个自定义 Hook，用于判断当前视口是否为移动设备（宽度小于 1024px）。
 * 它通过在客户端挂载后安全地访问 `window` 对象，解决了服务端渲染（SSR）中
 * `window` 未定义的问题，并能响应视口大小的变化。
 *
 * @returns {boolean} - 如果是移动端视口，返回 true，否则返回 false。
 */
export const useIsMobile = (): boolean => {
  // 状态初始化为 false，确保在服务端和客户端初始渲染时行为一致。
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 定义检查设备尺寸的函数
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // 组件在客户端挂载后，立即执行一次检查
    checkDevice();

    // 添加事件监听器，以便在窗口大小变化时重新检查
    window.addEventListener('resize', checkDevice);

    // 组件卸载时，清理事件监听器，防止内存泄漏
    return () => window.removeEventListener('resize', checkDevice);
  }, []); // 空依赖数组确保此 effect 仅在挂载和卸载时运行

  return isMobile;
};
