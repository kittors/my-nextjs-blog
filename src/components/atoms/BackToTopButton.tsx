// src/components/atoms/BackToTopButton.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile'; // 导入新的 Hook

/**
 * BackToTopButton 组件：一个原子级别的 UI 控件。
 * 核心修正：此组件现在通过 `useIsMobile` Hook 判断，仅在桌面端环境下渲染。
 * 这从根本上解决了在移动端可能出现的闪现问题。
 */
const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const isMobile = useIsMobile(); // 使用 Hook 获取设备状态

  // 监听滚动事件来切换按钮的可见性
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // 平滑滚动到页面顶部的处理函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // 如果是移动端，则不渲染任何内容
  if (isMobile) {
    return null;
  }

  // 仅在桌面端渲染此按钮
  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`back-to-top-button ${isVisible ? 'visible' : ''}`}
      aria-label="回到顶部"
    >
      <ArrowUp size={24} />
    </button>
  );
};

export default BackToTopButton;
