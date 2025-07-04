// src/components/atoms/Tag.tsx
'use client';

import React from 'react';

// 定义 Tag 组件的 Props 类型
interface TagProps {
  /**
   * 标签的文本内容。
   */
  label: string;
  /**
   * 与此标签关联的文章数量。
   */
  count: number;
  /**
   * 点击标签时的回调函数。
   */
  onClick: () => void;
  /**
   * 决定标签是否处于激活状态的布尔值。
   */
  isActive: boolean;
  /**
   * 用于为标签分配一个独特的颜色。
   */
  colorClass: string;
}

/**
 * Tag 组件：一个原子级别的 UI 组件，用于显示单个标签。
 *
 * 它的职责是清晰地展示标签的名称和关联的文章数量，并处理点击交互。
 * 其视觉表现（如颜色和激活状态）完全由 props 控制，使其具有高度的可重用性。
 *
 * @param {TagProps} props - 组件属性。
 */
const Tag: React.FC<TagProps> = ({ label, count, onClick, isActive, colorClass }) => {
  // 根据是否激活来动态组合 CSS 类
  const finalClass = `
    tag-item
    ${colorClass}
    ${isActive ? 'active' : ''}
  `;

  return (
    <button onClick={onClick} className={finalClass}>
      <span className="tag-label">{label}</span>
      <span className="tag-count">{count}</span>
    </button>
  );
};

export default Tag;
