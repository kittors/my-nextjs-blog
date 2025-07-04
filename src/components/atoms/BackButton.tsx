// src/components/atoms/BackButton.tsx
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

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
 * 遵循原子设计原则，这是一个独立的 UI 单元，封装了“返回上一页”的交互逻辑。
 * 核心修正：
 * 移除了基于 `window.history.length` 的条件判断，现在点击按钮将始终
 * 使用 `router.push` 导航到 `fallbackHref`。这解决了当 URL 仅因 hash 变化时
 * `router.back()` 行为不符合预期的问题，确保了“返回所有文章”按钮的可靠性。
 *
 * @param {BackButtonProps} props - 组件属性。
 */
const BackButton: React.FC<BackButtonProps> = ({ fallbackHref }) => {
  const router = useRouter();

  const handleBackClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // 阻止默认的链接行为

    // 核心修正：直接使用 router.push 导航到 fallbackHref
    // 这确保了无论浏览器历史记录状态如何，都能可靠地回到指定页面。
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
