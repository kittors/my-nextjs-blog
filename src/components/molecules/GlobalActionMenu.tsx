// src/components/molecules/GlobalActionMenu.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Menu, X, ArrowUp, ListOrdered } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

// 定义组件的 Props 类型
interface GlobalActionMenuProps {
  onToggleToc?: () => void; // 用于触发展开/关闭文章大纲的回调函数，现在是可选的
}

/**
 * GlobalActionMenu 组件：一个全局浮动操作菜单。
 *
 * 核心修正：
 * 修复了移动端子按钮点击事件有时需要点击两次的问题。
 * 策略如下：
 * 1. 统一子按钮点击后关闭菜单的逻辑，不再根据可见按钮数量判断。
 * 2. 确保在执行操作后立即尝试关闭菜单，避免状态冲突。
 * 3. 简化了 `visibleActionButtons` 的声明，直接构建并使用。
 * 4. **关键：** 结合 CSS 中 `touch-action: manipulation;` 属性，
 * 以优化移动端浏览器对点击事件的解释和响应，减少延迟或双击问题。
 *
 * 这提升了用户体验，减少了不必要的点击。
 *
 * @param {GlobalActionMenuProps} props - 组件属性。
 */
const GlobalActionMenu: React.FC<GlobalActionMenuProps> = ({ onToggleToc }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrollButtonVisible, setIsScrollButtonVisible] = useState(false);
  const isMobile = useIsMobile(); // 判断当前是否为移动端

  // 监听滚动事件，以确定“回到顶部”按钮是否应该显示
  useEffect(() => {
    const checkScroll = () => {
      // 当页面滚动超过 300 像素时，显示“回到顶部”按钮
      if (window.scrollY > 300) {
        setIsScrollButtonVisible(true);
      } else {
        setIsScrollButtonVisible(false);
      }
    };

    // 添加滚动事件监听器
    window.addEventListener('scroll', checkScroll);
    // 组件卸载时移除事件监听器，防止内存泄漏
    return () => window.removeEventListener('scroll', checkScroll);
  }, []); // 空依赖数组，确保只在组件挂载和卸载时执行

  // 平滑滚动到页面顶部的处理函数
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 核心修正：点击子按钮后，无论如何都尝试关闭菜单。
    // 这避免了多次点击的问题，因为菜单状态会立即更新。
    setIsMenuOpen(false);
  }, []);

  // 触发文章大纲显示/隐藏的处理函数
  const handleToggleToc = useCallback(() => {
    // 只有当 onToggleToc 回调函数存在时才调用它
    if (onToggleToc) {
      onToggleToc();
      // 核心修正：点击子按钮后，无论如何都尝试关闭菜单。
      setIsMenuOpen(false);
    }
  }, [onToggleToc]);

  // 根据条件构建一个包含所有可见子操作按钮的数组
  // 使用 React.ReactElement[] 明确类型
  const visibleActionButtons: React.ReactElement[] = [];

  // 检查“回到顶部”按钮是否应该可见
  if (isScrollButtonVisible) {
    visibleActionButtons.push(
      <button
        key="scrollToTop" // 为列表中的元素提供唯一的 key
        onClick={scrollToTop}
        className="action-button"
        aria-label="回到顶部"
        title="回到顶部"
      >
        <ArrowUp size={20} />
      </button>
    );
  }

  // 检查“切换大纲”按钮是否应该可见（仅在移动端且提供了 onToggleToc 回调时）
  if (onToggleToc && isMobile) {
    visibleActionButtons.push(
      <button
        key="toggleToc" // 为列表中的元素提供唯一的 key
        onClick={handleToggleToc}
        className="action-button"
        aria-label="切换大纲"
        title="切换大纲"
      >
        <ListOrdered size={20} />
      </button>
    );
  }

  // 根据可见按钮的数量决定渲染逻辑
  const visibleActionButtonsCount = visibleActionButtons.length;

  // 如果没有可见按钮，则不渲染任何内容
  if (visibleActionButtonsCount === 0) {
    return null;
  }

  // 如果只有一个可见按钮，则直接渲染该按钮，无需主 FAB
  // 核心修正：当只有一个可见按钮时，即使它是一个 FAB，也直接渲染。
  // 这消除了“点击主按钮展开，再点击子按钮执行”的中间步骤，简化了交互。
  if (visibleActionButtonsCount === 1) {
    return (
      <div className="global-action-menu-container">
        {visibleActionButtons[0]} {/* 直接渲染唯一的按钮 */}
      </div>
    );
  }

  // 如果有两个或更多可见按钮，则渲染主 FAB 和可展开的子菜单
  return (
    <div className="global-action-menu-container">
      {/* 子操作按钮的容器，根据 isMenuOpen 状态控制显示/隐藏 */}
      <div className={`action-buttons ${isMenuOpen ? 'open' : ''}`}>
        {visibleActionButtons} {/* 渲染所有可见的子按钮 */}
      </div>

      {/* 主触发按钮，点击切换子菜单的显示状态 */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="main-fab"
        aria-label="打开操作菜单"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />} {/* 根据菜单状态切换图标 */}
      </button>
    </div>
  );
};

export default GlobalActionMenu;
