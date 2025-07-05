// src/components/atoms/BackButton.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import NProgress from 'nprogress'; // 核心新增：导入 NProgress

interface BackButtonProps {
  /**
   * 当点击返回按钮时，始终导航到的备用链接。
   * 这确保了无论用户之前如何导航（包括仅改变 URL hash），
   * 都能可靠地回到指定的页面。
   */
  fallbackHref: string;
}

/**
 * BackButton 组件：一个智能的、可复用的返回按钮。
 *
 * 核心修正：
 * 在进行程序化导航前，手动调用 `NProgress.start()`，以确保进度条能够
 * 在这类非用户直接点击链接的场景下也能正确触发。
 *
 * @param {BackButtonProps} props - 组件属性。
 */
const BackButton: React.FC<BackButtonProps> = ({ fallbackHref }) => {
  const router = useRouter();

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 阻止默认的链接行为

    // 核心新增：在导航前手动启动进度条
    NProgress.start();

    // 使用 router.push 导航到 fallbackHref
    router.push(fallbackHref);
  };

  return (
    <button onClick={handleBackClick} className="back-button-container">
      <ArrowLeft size={16} className="back-button-icon" />
      <span className="back-button-text">返回所有文章</span>
    </button>
  );
};

export default BackButton;
