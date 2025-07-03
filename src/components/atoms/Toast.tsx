// src/components/atoms/Toast.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // 用于将 Toast 渲染到 body 外部

// 定义 Toast 组件的 Props 类型
interface ToastProps {
  message: string;        // Toast 显示的消息
  duration?: number;      // Toast 持续时间（毫秒），默认为 3000ms
  onClose?: () => void;   // Toast 关闭时的回调函数
}

/**
 * Toast 组件：显示一个短暂的消息提示。
 * 这是一个原子组件，负责消息的显示和动画。
 * @param {ToastProps} props - 组件属性。
 */
const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 组件挂载时显示 Toast
    setIsVisible(true);

    // 设置定时器，在 duration 后隐藏 Toast
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
      // 在动画完成后调用 onClose
      setTimeout(() => {
        onClose?.(); // 使用可选链操作符
      }, 300); // 假设动画时间为 300ms
    }, duration);

    // 清理函数：组件卸载时清除定时器，防止内存泄漏
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, onClose]); // 依赖 duration 和 onClose

  // 如果 Toast 不可见，则不渲染
  if (!isVisible) {
    return null;
  }

  // 使用 createPortal 将 Toast 渲染到 document.body，确保它在最顶层
  return createPortal(
    <div
      className={`
        fixed inset-x-0 bottom-4 mx-auto max-w-xs
        bg-foreground text-background text-sm p-3 rounded-md shadow-lg
        flex items-center justify-center
        transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        z-[10000] /* 确保 Toast 在最顶层 */
      `}
      role="alert"
    >
      {message}
    </div>,
    document.body // 渲染到 body 元素
  );
};

export default Toast;