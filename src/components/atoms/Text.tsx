import React from 'react';

// 定义 Text 组件的 Props 类型
interface TextProps {
  children: React.ReactNode;
  className?: string; // 允许外部传入 Tailwind CSS 类名
  as?: 'p' | 'span' | 'div'; // 允许指定渲染的 HTML 标签
}

/**
 * Text 组件：用于渲染通用文本内容。
 * 遵循原子设计原则，这是一个基础的文本元素。
 * @param {TextProps} props - 组件属性。
 * @param {React.ReactNode} props.children - 文本内容。
 * @param {string} [props.className] - 额外的 CSS 类名。
 * @param {'p' | 'span' | 'div'} [props.as] - 渲染的 HTML 标签，默认为 'p'。
 */
const Text: React.FC<TextProps> = ({ children, className = '', as: Component = 'p' }) => {
  // 默认样式，可以根据需要调整
  const defaultClasses = 'text-base text-gray-700 leading-relaxed';

  return <Component className={`${defaultClasses} ${className}`}>{children}</Component>;
};

export default Text;