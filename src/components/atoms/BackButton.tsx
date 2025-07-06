// src/components/atoms/BackButton.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import NProgress from 'nprogress';

// 核心修正：更新 Props 接口
interface BackButtonProps {
  fallbackHref: string;
  label: string; // 接收来自字典的按钮文本
}

/**
 * BackButton 组件：一个智能的、可复用的返回按钮。
 *
 * @param {BackButtonProps} props - 组件属性。
 */
const BackButton: React.FC<BackButtonProps> = ({ fallbackHref, label }) => {
  const router = useRouter();

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    NProgress.start();
    router.push(fallbackHref);
  };

  return (
    <button onClick={handleBackClick} className="back-button-container">
      <ArrowLeft size={16} className="back-button-icon" />
      {/* 核心修正：使用 label prop 代替硬编码文本 */}
      <span className="back-button-text">{label}</span>
    </button>
  );
};

export default BackButton;
