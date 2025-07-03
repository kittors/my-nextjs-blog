// src/contexts/ToastContext.tsx
"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback, useRef } from 'react';
import Toast from '@/components/atoms/Toast'; // 导入 Toast 组件

// 定义 Toast 消息的类型
interface ToastMessage {
  id: string;      // 唯一ID，用于管理多个 Toast
  message: string; // 消息内容
  duration?: number; // 持续时间
}

// 定义 Toast 上下文的类型
interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
}

// 创建 Toast 上下文，提供默认值
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// 定义 ToastProvider 的 Props 类型
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * ToastProvider 组件：提供 Toast 上下文给子组件。
 * 管理 Toast 消息队列，并渲染 Toast 组件。
 * @param {ToastProviderProps} props - 组件属性。
 * @param {ReactNode} props.children - 要使用 Toast 的子组件。
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0); // 用于生成 Toast 的唯一 ID

  // 显示 Toast 的函数
  const showToast = useCallback((message: string, duration?: number) => {
    const id = (nextId.current++).toString(); // 生成唯一 ID
    setToasts((prevToasts) => [...prevToasts, { id, message, duration }]);
  }, []);

  // Toast 关闭时的回调函数，用于从队列中移除 Toast
  const handleToastClose = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* 渲染所有活动的 Toast 消息 */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          duration={toast.duration}
          onClose={() => handleToastClose(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

/**
 * useToast Hook：用于在组件中显示 Toast 消息。
 * @returns {ToastContextType} - 包含 showToast 函数。
 * @throws {Error} 如果在 ToastProvider 之外使用，则抛出错误。
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};