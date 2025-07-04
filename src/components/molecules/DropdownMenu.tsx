// src/components/molecules/DropdownMenu.tsx
'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';

// 定义 DropdownMenu 组件的 Props 类型
interface DropdownMenuProps {
  /**
   * 触发下拉菜单显示的元素 (例如一个按钮或图标)。
   */
  trigger: ReactNode;
  /**
   * 下拉菜单中显示的内容 (例如链接列表)。
   */
  children: ReactNode;
  /**
   * 激活菜单的方式：'hover' 或 'click'。
   * @default 'click'
   */
  activation?: 'hover' | 'click';
  /**
   * 菜单面板的对齐方式。
   * @default 'right'
   */
  align?: 'left' | 'right';
}

/**
 * DropdownMenu 组件：一个可重用的下拉菜单。
 *
 * 遵循原子设计原则，这是一个分子级别的组件，它将触发器和弹出内容组合在一起，
 * 并封装了控制其显示/隐藏的交互逻辑。
 *
 * @param {DropdownMenuProps} props - 组件属性。
 */
const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  activation = 'click',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 处理点击外部区域关闭菜单的逻辑
  useEffect(() => {
    if (activation !== 'click' || !isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, activation]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止事件冒泡，避免立即触发 handleClickOutside
    setIsOpen(prev => !prev);
  };

  const handleMouseEnter = () => {
    if (activation === 'hover') {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (activation === 'hover') {
      setIsOpen(false);
    }
  };

  const alignmentClass = align === 'left' ? 'dropdown-panel-left' : 'dropdown-panel-right';

  return (
    <div
      className="dropdown-container"
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="dropdown-trigger"
        onClick={activation === 'click' ? handleTriggerClick : undefined}
      >
        {trigger}
      </div>
      {isOpen && (
        <div className={`dropdown-panel ${alignmentClass}`} onClick={() => setIsOpen(false)}>
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
