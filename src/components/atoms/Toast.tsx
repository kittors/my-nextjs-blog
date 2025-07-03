// src/components/atoms/Toast.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { type ToastType } from '@/contexts/ToastContext';

// 定义 Toast 组件的 Props
interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

// 定义一个映射，将 Toast 类型与对应的图标和基础类名关联起来
const toastConfig = {
  success: {
    Icon: CheckCircle2,
    className: 'toast--success',
  },
  warning: {
    Icon: AlertTriangle,
    className: 'toast--warning',
  },
  error: {
    Icon: XCircle,
    className: 'toast--error',
  },
  default: {
    Icon: Info,
    className: 'toast--default', // 你可以在 globals.css 中为 default 添加样式
  },
};

/**
 * Toast 组件：
 * 遵循原子设计原则，这是一个原子级别的 UI 组件。
 * 它只负责一件事：以美观的方式显示一条通知消息。
 * 其外观（颜色、图标）由传入的 `type` prop 决定，其生命周期（显示与消失）由内部状态和计时器管理。
 * @param {ToastProps} props - 组件属性。
 */
const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // 设置一个计时器，在指定时长后开始退出动画
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    // 清理函数：如果组件在计时器结束前被卸载，则清除计时器
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (isExiting) {
      // 在退出动画结束后（动画时长为 300ms），调用 onClose 回调
      const timer = setTimeout(onClose, 300);
      return () => clearTimeout(timer);
    }
  }, [isExiting, onClose]);

  const { Icon, className } = toastConfig[type] || toastConfig.default;

  return (
    <div className={`toast ${className} ${isExiting ? 'exiting' : ''}`} role="alert">
      <Icon size={20} />
      <span>{message}</span>
    </div>
  );
};

export default Toast;
