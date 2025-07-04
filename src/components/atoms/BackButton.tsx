// src/components/atoms/BackButton.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  /**
   * 在无法返回上一页（例如，用户直接打开了当前页面）时，提供的备用链接。
   */
  fallbackHref: string;
}

/**
 * BackButton 组件：一个智能的、可复用的返回按钮。
 *
 * 遵循原子设计原则，这是一个独立的 UI 单元，封装了“返回上一页”的交互逻辑。
 * 它会优先尝试使用浏览器的历史记录进行后退，如果无法实现，则会导航到
 * 一个指定的备用链接，确保了用户体验的连贯性和健壮性。
 *
 * @param {BackButtonProps} props - 组件属性。
 */
const BackButton: React.FC<BackButtonProps> = ({ fallbackHref }) => {
  const router = useRouter();

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // 检查是否有历史记录可以返回
    if (window.history.length > 1) {
      router.back();
    } else {
      // 如果没有，则导航到备用链接
      router.push(fallbackHref);
    }
  };

  return (
    <button onClick={handleBackClick} className="back-button-container">
      <ArrowLeft size={16} className="back-button-icon" />
      <span className="back-button-text">返回所有文章</span>
    </button>
  );
};

export default BackButton;
