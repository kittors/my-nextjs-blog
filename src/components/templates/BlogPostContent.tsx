// src/components/templates/BlogPostContent.tsx
"use client"; // <-- 这是一个客户端组件

import React, { useRef, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { Copy } from 'lucide-react';

// 导入原子组件
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import Link from 'next/link';

// 定义 Props 接口
interface BlogPostContentProps {
  post: {
    title: string;
    author: string;
    date: string;
    contentHtml: string; // 修正：类型为原始 HTML 字符串
  };
}

/**
 * BlogPostContent 组件：负责渲染单篇博客文章的内容和所有客户端交互。
 * 这是一个客户端组件，处理代码高亮、复制按钮和页面内链接的交互。
 * @param {BlogPostContentProps} props - 组件属性。
 * @param {object} props.post - 博客文章数据，包含标题、作者、日期和原始 HTML 内容。
 */
const BlogPostContent: React.FC<BlogPostContentProps> = ({ post }) => {
  const articleContentRef = useRef<HTMLDivElement>(null); // 在客户端组件中使用 useRef
  const { showToast } = useToast();

  useEffect(() => {
    if (!articleContentRef.current) return;

    // 动态导入 Prism.js 核心
    import('prismjs')
      .then(async (Prism) => {
        // 动态导入所有你需要高亮的语言组件
        // 这是关键步骤，因为服务器端不再预处理 language-xxx 类
        // @ts-expect-error: No type definitions for Prism language components
                await import('prismjs/components/prism-javascript');
        // @ts-expect-error: No type definitions for Prism language components
                await import('prismjs/components/prism-typescript');
        // @ts-expect-error: No type definitions for Prism language components
                await import('prismjs/components/prism-java');
        // @ts-expect-error: No type definitions for Prism language components
                await import('prismjs/components/prism-python');
        // @ts-expect-error: No type definitions for Prism language components
                await import('prismjs/components/prism-css');
        // @ts-expect-error: No type definitions for Prism language components
                await import('prismjs/components/prism-markup'); // for HTML
        // @ts-expect-error: No type definitions for Prism language components
                await import('prismjs/components/prism-rust');
        // @ts-expect-error: No type definitions for Prism language components
                await import('prismjs/components/prism-go');
        // @ts-expect-error: No type definitions for Prism plugins
                await import('prismjs/plugins/line-numbers/prism-line-numbers.min.js');


        // 查找所有 <pre><code> 组合
        // 这些代码块由 remark-html 生成，会带有 language-xxx 类
        const codeBlocks = articleContentRef.current.querySelectorAll('pre code');

        codeBlocks.forEach((codeElement) => {
          const preElement = codeElement.parentElement as HTMLPreElement; // 获取父级 <pre> 元素

          // 重新高亮代码块
          Prism.highlightElement(codeElement);

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
            const textToCopy = codeElement.innerText; // 获取可见文本
            try {
              await navigator.clipboard.writeText(textToCopy);
              showToast('代码已复制到剪贴板！', 2000);
            } catch (err) {
              console.error('无法复制代码: ', err);
              showToast('复制失败，请手动复制。', 3000);
            }
          };

          copyButtonContainer.addEventListener('click', handleCopy);

          (preElement as HTMLPreElement).style.position = 'relative';
          preElement.classList.add('group');
          preElement.appendChild(copyButtonContainer);
        });
      })
      .catch(error => {
        console.error('Failed to load Prism.js or its components:', error);
        showToast('代码高亮加载失败！', 3000);
      });

    // 清理函数：确保在组件卸载或内容更新时清理掉之前添加的按钮和监听器
    return () => {
      if (!articleContentRef.current) return;
      const preElements = articleContentRef.current.querySelectorAll('pre[class*="language-"]');
      preElements.forEach((pre) => {
        const copyButtonContainer = pre.querySelector('.copy-button-container');
        if (copyButtonContainer) {
          copyButtonContainer.removeEventListener('click', () => {});
          pre.removeChild(copyButtonContainer);
        }
      });
    };
  }, [articleContentRef, showToast, post.contentHtml]); // 依赖 post.contentHtml，确保内容更新时重新高亮

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      {/* 返回首页链接 */}
      <Link href="/" className="text-primary hover:underline mb-8 inline-block flex items-center group">
        <svg className="w-5 h-5 mr-2 -translate-x-1 group-hover:-translate-x-0 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        返回所有文章
      </Link>

      {/* 文章标题 */}
      <Heading level={1} className="text-4xl font-extrabold text-neutral-900 mb-4">
        {post.title}
      </Heading>

      {/* 文章元数据 */}
      <div className="text-neutral-500 text-sm mb-8 border-b border-neutral-200 pb-4">
        <Text as="span" className="mr-4">
          作者: {post.author}
        </Text>
        <Text as="span">
          日期: {new Date(post.date).toLocaleDateString('zh-CN')}
        </Text>
      </div>

      {/* 文章内容 */}
      {/* 使用一个 div 来包裹 dangerouslySetInnerHTML，并传入 ref */}
      <div
        ref={articleContentRef} // 将 ref 绑定到这个 div
        className="prose prose-lg max-w-none text-neutral-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
};

export default BlogPostContent;