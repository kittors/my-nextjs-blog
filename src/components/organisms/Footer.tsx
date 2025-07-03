// src/components/organisms/Footer.tsx
import React from 'react';

// 定义 Footer 组件的 Props 类型
// 这样的接口定义使得组件的配置既灵活又类型安全。
interface FooterProps {
  /** 控制 Footer 是否在页面上渲染 */
  isVisible?: boolean;
  /** Footer 中显示的文本内容，支持 HTML 实体 */
  text: string;
  /** Tailwind CSS 类名，用于定义 Footer 的背景颜色 */
  backgroundColor?: string;
  /** Tailwind CSS 类名，用于定义 Footer 的文本颜色 */
  textColor?: string;
}

/**
 * Footer 组件：网站的底部页脚。
 * 作为一个“组织(organism)”级别的组件，它构成了页面的一个独立、完整的部分。
 * 它的职责是统一展示网站的版权信息或任何其他页脚内容。
 *
 * @param {FooterProps} props - 组件的属性，用于定制其外观和行为。
 * @returns {React.ReactElement | null} - 渲染后的 Footer 组件或在 isVisible 为 false 时返回 null。
 */
const Footer: React.FC<FooterProps> = ({
  isVisible = true,
  text,
  backgroundColor = 'bg-background', // 默认使用主题背景色
  textColor = 'text-foreground', // 默认使用主题前景色
}) => {
  // 如果设置为不可见，则不渲染任何内容
  if (!isVisible) {
    return null;
  }

  // 优化点：移除了不必要的 Flexbox 相关类名 ('flex', 'items-center', 'justify-center')。
  // 原因：当容器内只有一个文本元素时，'text-center' 类已经足以实现内容的水平居中，
  // 使用 Flexbox 会增加不必要的渲染开销。这体现了代码的简洁性和性能优化的思想。
  const footerClasses = [
    backgroundColor,
    textColor,
    'p-6', // 提供足够的内边距，确保内容不会紧贴边缘
    'text-center', // 高效地实现单行文本的水平居中
    'border-t', // 在页脚顶部添加一条分割线，以区分主内容
    'border-neutral-200', // 定义分割线的颜色
    'dark:border-neutral-800', // 适配暗黑模式下的边框颜色
  ].join(' ');

  return (
    <footer className={footerClasses}>
      <p dangerouslySetInnerHTML={{ __html: text }} />
    </footer>
  );
};

export default Footer;
