// src/contexts/ToastContext.tsx
"use client";

// 核心修正 1: 从 React 中导入 useMemo
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Toast from '@/components/atoms/Toast';

// 定义 Toast 的类型，'default' 可以作为备用
export type ToastType = 'success' | 'warning' | 'error' | 'default';

// 定义单个 Toast 消息的结构
interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

// 定义上下文提供的值的类型
interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const showToast = useCallback((
    message: string,
    type: ToastType = 'default',
    duration: number = 3000
  ) => {
    const id = Date.now(); // 使用时间戳作为唯一 ID
    setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // 核心修正 2: 使用 useMemo 包装 context 的 value。
  // `showToast` 函数本身通过 useCallback 保证了引用的稳定性。
  // `useMemo` 则确保了包含 `showToast` 的这个 value 对象本身的引用也是稳定的。
  // 这样，当 ToastProvider 因内部状态 `toasts` 改变而重渲染时，
  // 消费此 context 的子组件（如 BlogPostContent）不会因为 context value 的引用变化而重渲染。
  const contextValue = useMemo(() => ({
    showToast
  }), [showToast]);

  return (
    // 核心修正 3: 将 memoized 的 contextValue 传递给 Provider。
    <ToastContext.Provider value={contextValue}>
      {children}
      {isMounted && createPortal(
        <div className="toast-container">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
