// src/components/molecules/GlobalActionMenu.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUp, ListOrdered } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile'; // 核心修正：导入 useIsMobile hook

// 定义组件的 Props 类型
interface GlobalActionMenuProps {
  onToggleToc: () => void; // 用于触发展开/关闭文章大纲的回调函数
}

/**
 * GlobalActionMenu 组件：一个全局浮动操作菜单。
 * 核心修正：此组件现在是响应式的。
 * “切换大纲”按钮仅在移动设备上显示，因为在 PC 端大纲是永久可见的侧边栏。
 *
 * @param {GlobalActionMenuProps} props - 组件属性。
 */
const GlobalActionMenu: React.FC<GlobalActionMenuProps> = ({ onToggleToc }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const isMobile = useIsMobile(); // 核心修正：判断当前是否为移动端

  // 监听滚动事件，以确定“回到顶部”按钮是否应该显示
  useEffect(() => {
    const checkScroll = () => {
      if (window.scrollY > 300) {
        setIsScrollButtonVisible(true);
      } else {
        setIsScrollButtonVisible(false);
      }
    };

    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  // 平滑滚动到页面顶部的处理函数
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false); // 操作后自动关闭菜单
  };

  // 触发文章大纲显示/隐藏的处理函数
  const handleToggleToc = () => {
    onToggleToc();
    setIsMenuOpen(false); // 操作后自动关闭菜单
  };

  // 核心修正：仅当有按钮需要显示在菜单中时，才渲染主菜单按钮。
  // 在 PC 端，如果只有“回到顶部”按钮，当页面在顶部时，整个菜单都可以不显示。
  const shouldShowMenu = isScrollButtonVisible || isMobile;

  if (!shouldShowMenu) {
    return null;
  }

  return (
    <div className="global-action-menu-container">
      {/* 子操作按钮的容器 */}
      <div className={`action-buttons ${isMenuOpen ? 'open' : ''}`}>
        {/* “回到顶部”按钮，根据滚动位置条件渲染 */}
        {isScrollButtonVisible && (
          <button
            onClick={scrollToTop}
            className="action-button"
            aria-label="回到顶部"
            title="回到顶部"
          >
            <ArrowUp size={20} />
          </button>
        )}
        {/* 核心修正：“切换大纲”按钮，仅在移动端渲染 */}
        {isMobile && (
          <button
            onClick={handleToggleToc}
            className="action-button"
            aria-label="切换大纲"
            title="切换大纲"
          >
            <ListOrdered size={20} />
          </button>
        )}
      </div>

      {/* 主触发按钮 */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="main-fab"
        aria-label="打开操作菜单"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
};

export default GlobalActionMenu;
