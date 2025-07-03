// src/components/atoms/BackToTopButton.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

/**
 * BackToTopButton 组件：一个原子级别的 UI 控件。
 * 它的唯一职责是提供一个“回到顶部”的功能，并根据页面滚动位置管理自身的可见性。
 */
const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

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

    // 组件卸载时移除事件监听器
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // 平滑滚动到页面顶部的处理函数
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

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
