// src/components/templates/BlogPostContent.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import Link from 'next/link';

// 定义 Props 接口
interface BlogPostContentProps {
  post: {
    title: string;
    author: string;
    date: string;
    contentHtml: string;
  };
}

/**
 * BlogPostContent 组件：负责渲染单篇博客文章的内容。
 * 代码高亮已在服务器端完成，此客户端组件仅负责交互，如此处为代码块动态添加复制按钮。
 * @param {BlogPostContentProps} props - 组件属性。
 */
const BlogPostContent: React.FC<BlogPostContentProps> = ({ post }) => {
  const articleContentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!articleContentRef.current) return;

    // 查找所有由 rehype-pretty-code 生成的代码块容器
    const codeContainers = articleContentRef.current.querySelectorAll('div[data-rehype-pretty-code-fragment]');

    codeContainers.forEach(container => {
      // 防止重复添加按钮
      if (container.querySelector('.copy-button')) {
        return;
      }

      const codeElement = container.querySelector('code');
      if (!codeElement) return;

      // 创建复制按钮
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.ariaLabel = '复制代码';

      // 定义 SVG 图标
      const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2"></path></svg>`;
      const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      button.innerHTML = copyIconSVG + checkIconSVG;

      // 添加点击事件监听器
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(codeElement.innerText);
          showToast('代码已复制到剪贴板！', 2000);
          button.dataset.copied = 'true';
          setTimeout(() => {
            delete button.dataset.copied;
          }, 2000);
        } catch (err) {
          console.error('无法复制代码: ', err);
          showToast('复制失败，请手动复制。', 3000);
        }
      });

      // 将按钮添加到容器中
      container.appendChild(button);
    });
  }, [showToast]);

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/" className="text-primary hover:underline mb-8 inline-block flex items-center group">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        返回所有文章
      </Link>

      <Heading level={1} className="text-4xl font-extrabold text-neutral-900 mb-4">
        {post.title}
      </Heading>

      <div className="text-neutral-500 text-sm mb-8 border-b border-neutral-200 pb-4">
        <Text as="span" className="mr-4">作者: {post.author}</Text>
        <Text as="span">日期: {new Date(post.date).toLocaleDateString('zh-CN')}</Text>
      </div>

      <div
        ref={articleContentRef}
        className="prose prose-lg max-w-none text-neutral-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
};

export default BlogPostContent;
