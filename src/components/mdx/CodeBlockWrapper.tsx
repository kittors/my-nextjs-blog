// src/components/mdx/CodeBlockWrapper.tsx
"use client"; // 这是一个客户端组件

import React, { useRef, useEffect, ReactNode } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Copy } from 'lucide-react';

// 定义 Props 接口
interface CodeBlockWrapperProps {
  children: ReactNode; // 代码块内容，通常是 <pre><code class="language-xxx">...</code></pre>
  className?: string; // MDX 会传递一些默认类名
}

/**
 * CodeBlockWrapper 组件：用于包裹 MDX 渲染的代码块，并添加复制按钮。
 * 这是 MDX 自定义组件，确保代码高亮后的交互性。
 */
const CodeBlockWrapper: React.FC<CodeBlockWrapperProps> = ({ children, className }) => {
  // 修正：codeBlockRef 现在引用的是 <pre> 元素，所以类型为 HTMLPreElement
  const codeBlockRef = useRef<HTMLPreElement>(null); 
  const { showToast } = useToast();

  useEffect(() => {
    // 确保 ref.current 存在且是 <pre> 元素
    if (!codeBlockRef.current || codeBlockRef.current.tagName.toLowerCase() !== 'pre') {
      return;
    }

    const preElement = codeBlockRef.current;
    const codeElement = preElement.querySelector('code');

    if (!codeElement) return;

    // 检查是否已经添加过复制按钮，避免重复添加
    if (preElement.querySelector('.copy-button-container')) {
      return;
    }

    const copyButtonContainer = document.createElement('div');
    copyButtonContainer.className = `
      copy-button-container absolute top-2 right-2 p-2 rounded-md
      bg-neutral-800 text-neutral-100 hover:bg-neutral-700
      transition-colors duration-200 opacity-0 group-hover:opacity-100
      focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary
      z-20 cursor-pointer
    `;

    const copyIconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy">
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2"></path>
      </svg>
    `;
    copyButtonContainer.innerHTML = copyIconSvg;

    const handleCopy = async () => {
      const textToCopy = codeElement.innerText;
      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast('代码已复制到剪贴板！', 2000);
      } catch (err) {
        console.error('无法复制代码: ', err);
        showToast('复制失败，请手动复制。', 3000);
      }
    };

    copyButtonContainer.addEventListener('click', handleCopy);

    preElement.style.position = 'relative'; // 确保 <pre> 是定位上下文
    preElement.classList.add('group'); // 为 hover 效果添加 group 类
    preElement.appendChild(copyButtonContainer);

    // 清理函数：移除事件监听器和按钮
    return () => {
      copyButtonContainer.removeEventListener('click', handleCopy);
      if (preElement.contains(copyButtonContainer)) {
        preElement.removeChild(copyButtonContainer);
      }
    };
  }, [showToast, children]); // 依赖 children，确保代码块内容更新时重新处理

  return (
    // 修正：直接将 ref 和 className 传递给 children（预期是 <pre> 元素）
    // 注意：这样要求 MDX 渲染的 children 必须是 <pre> 元素
    // MDXRemote 会确保这一点，因为它将 pre 标签映射到这个组件
    // @ts-ignore: children 可能是 ReactNode 类型，但我们通过 MDX 映射确保它是 <pre>
    React.cloneElement(children as React.ReactElement, { ref: codeBlockRef, className: `${children.props.className || ''} ${className || ''}` })
  );
};

export default CodeBlockWrapper;