// src/components/organisms/Footer.tsx
import React from 'react';

// 定义 Footer 组件的 Props 类型
interface FooterProps {
  isVisible?: boolean;       // 控制 Footer 是否显示
  text: string;             // Footer 显示的文本内容
  backgroundColor?: string;  // Footer 背景颜色类名
  textColor?: string;        // Footer 文本颜色类名
}

/**
 * Footer 组件：网站的底部页脚。
 * 遵循原子设计原则，这是一个组织组件，负责网站的底部信息展示。
 * @param {FooterProps} props - 组件属性。
 */
const Footer: React.FC<FooterProps> = ({
  isVisible = true,
  text,
  backgroundColor = 'bg-background', // 默认背景色
  textColor = 'text-foreground',       // 默认文本颜色
}) => {
  if (!isVisible) {
    return null;
  }

  const footerClasses = [
    backgroundColor,
    textColor,
    'p-6',          // 保持内边距
    'text-center',  // 保持文本水平居中
    'border-t',     // 顶部边框
    'border-neutral-200', // 边框颜色
    'flex',         // 将 footer 设为 flex 容器
    'items-center', // 垂直居中对齐子项
    'justify-center', // 水平居中对齐子项（尽管 text-center 也能做到，这里更规范）
  ].join(' ');

  return (
    <footer className={footerClasses}>
      {/* dangerouslySetInnerHTML 用于渲染包含 HTML 实体（如 &copy;）的字符串 */}
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </footer>
  );
};

export default Footer;