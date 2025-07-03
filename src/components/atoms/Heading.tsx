import React from 'react';
import type { JSX } from 'react';

// 定义 Heading 组件的 Props 类型
interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6; // H1 到 H6
  children: React.ReactNode;
  className?: string; // 允许外部传入 Tailwind CSS 类名
}

/**
 * Heading 组件：用于渲染不同级别的标题。
 * 遵循原子设计原则，这是一个基础的文本元素。
 * @param {HeadingProps} props - 组件属性。
 * @param {number} props.level - 标题级别 (1-6)。
 * @param {React.ReactNode} props.children - 标题内容。
 * @param {string} [props.className] - 额外的 CSS 类名。
 */
const Heading: React.FC<HeadingProps> = ({ level, children, className = '' }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements; // 动态创建 Hn 标签

  // 根据级别设置默认的 Tailwind CSS 样式
  let defaultClasses = '';
  switch (level) {
    case 1:
      defaultClasses = 'text-4xl font-bold mb-6';
      break;
    case 2:
      defaultClasses = 'text-3xl font-semibold mb-4';
      break;
    case 3:
      defaultClasses = 'text-2xl font-semibold mb-3';
      break;
    case 4:
      defaultClasses = 'text-xl font-medium mb-2';
      break;
    case 5:
      defaultClasses = 'text-lg font-medium mb-1';
      break;
    case 6:
      defaultClasses = 'text-base font-medium';
      break;
    default:
      defaultClasses = 'text-2xl font-semibold'; // 默认值
  }

  return <Tag className={`${defaultClasses} ${className}`}>{children}</Tag>;
};

export default Heading;
