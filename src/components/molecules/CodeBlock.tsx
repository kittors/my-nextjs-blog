// src/components/molecules/CodeBlock.tsx
"use client"; // 这是一个客户端组件

import React, { useRef, useEffect, useState } from 'react';
import { useToast } from '@/contexts/ToastContext'; // 导入 useToast Hook
import { Copy } from 'lucide-react'; // 导入复制图标

// 定义 CodeBlock 组件的 Props 类型
interface CodeBlockProps {
  // contentHtml 是 remark-prism 处理后的 HTML 字符串
  contentHtml: string;
}

/**
 * CodeBlock 组件：用于渲染高亮代码块，并提供复制功能。
 * 这是一个分子组件，包含代码内容、复制按钮和 Toast 提示逻辑。
 * @param {CodeBlockProps} props - 组件属性。
 */
const CodeBlock: React.FC<CodeBlockProps> = ({ contentHtml }) => {
  const codeBlockRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [hasRendered, setHasRendered] = useState(false); // 用于确保 Prism.highlightAll 仅在客户端运行一次

  useEffect(() => {
    // 只有在客户端挂载后才尝试加载 Prism.js 和高亮代码
    // 避免在服务器端尝试访问 DOM
    if (typeof window !== 'undefined' && codeBlockRef.current && !hasRendered) {
      import('prismjs').then((Prism) => {
        // 自动加载所有语言，或者只加载你需要的语言
        // Prism.highlightAll();
        // 也可以只高亮当前代码块
        Prism.highlightAllUnder(codeBlockRef.current!);
      });
      setHasRendered(true); // 标记已渲染
    }
  }, [hasRendered]); // 仅在 hasRendered 变化时运行

  const handleCopy = async () => {
    if (codeBlockRef.current) {
      // 获取代码文本（不含行号等额外元素）
      const codeElement = codeBlockRef.current.querySelector('code');
      if (codeElement) {
        const textToCopy = codeElement.innerText; // 使用 innerText 获取可见文本
        try {
          await navigator.clipboard.writeText(textToCopy);
          showToast('代码已复制到剪贴板！', 2000); // 显示 Toast 提示
        } catch (err) {
          console.error('无法复制代码: ', err);
          showToast('复制失败，请手动复制。', 3000);
        }
      }
    }
  };

  return (
    <div className="relative my-4 rounded-lg overflow-hidden group">
      {/* 复制按钮 */}
      <button
        onClick={handleCopy}
        className="
          absolute top-2 right-2 p-2 rounded-md
          bg-neutral-800 text-neutral-100 hover:bg-neutral-700
          transition-colors duration-200 opacity-0 group-hover:opacity-100
          focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary
          z-20
        "
        aria-label="Copy code"
        title="复制代码"
      >
        <Copy size={16} /> {/* Lucide Copy 图标 */}
      </button>

      {/* 代码内容，由 dangerouslySetInnerHTML 渲染 */}
      <div
        ref={codeBlockRef}
        className="relative z-10" // 确保代码内容在复制按钮下方，但高于背景
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
};

export default CodeBlock;