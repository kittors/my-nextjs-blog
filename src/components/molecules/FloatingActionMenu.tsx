// src/components/molecules/FloatingActionMenu.tsx
'use client';

import React, { useState } from 'react';
import { Menu, X, ArrowUp, ListOrdered } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile'; // 导入 Hook

interface FloatingActionMenuProps {
  onToggleToc: () => void;
}

/**
 * FloatingActionMenu 组件：一个仅在移动端显示的浮动操作菜单。
 * 核心修正：
 * 1. 使用 `useIsMobile` Hook，确保此组件仅在移动端渲染。
 * 2. 移除了基于滚动的可见性逻辑，使其在移动端页面加载后常驻。
 * 3. 样式在 CSS 文件中被更新为更简洁的黑白风格。
 */
const FloatingActionMenu: React.FC<FloatingActionMenuProps> = ({ onToggleToc }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile(); // 使用 Hook

  // 平滑滚动到页面顶部的处理函数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsOpen(false); // 操作后关闭菜单
  };

  // 触发文章大纲显示的处理函数
  const handleToggleToc = () => {
    onToggleToc();
    setIsOpen(false); // 操作后关闭菜单
  };

  // 切换菜单展开/折叠状态
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 如果不是移动端，则不渲染任何内容
  if (!isMobile) {
    return null;
  }

  return (
    <div className="floating-action-menu-container">
      {/* 子操作按钮 */}
      <div className={`action-buttons ${isOpen ? 'open' : ''}`}>
        <button
          onClick={scrollToTop}
          className="action-button"
          aria-label="回到顶部"
          title="回到顶部"
        >
          <ArrowUp size={20} />
        </button>
        <button
          onClick={handleToggleToc}
          className="action-button"
          aria-label="文章大纲"
          title="文章大纲"
        >
          <ListOrdered size={20} />
        </button>
      </div>

      {/* 主触发按钮 */}
      <button onClick={toggleMenu} className="main-fab" aria-label="打开操作菜单">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
};

export default FloatingActionMenu;
