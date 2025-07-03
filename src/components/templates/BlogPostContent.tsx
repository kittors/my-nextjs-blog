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
 * 这个客户端组件的核心职责是增强由服务器渲染的静态 HTML，
 * 通过动态创建并注入一个包含语言名称和复制按钮的“页眉”，
 * 来提升代码块的用户体验。
 * @param {BlogPostContentProps} props - 组件属性。
 */
const BlogPostContent: React.FC<BlogPostContentProps> = ({ post }) => {
  const articleContentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // 核心修正：移除 useEffect 的依赖数组。
  //
  // 问题根源：当点击复制按钮时，`showToast` 函数会更新 ToastContext 的状态，
  // 这会触发 BlogPostContent 组件的重新渲染。在重新渲染期间，
  // `dangerouslySetInnerHTML` 会用原始的 `post.contentHtml` 重置 DOM，
  // 这会清除我们通过脚本动态添加的代码块页眉。
  //
  // 旧的 useEffect 依赖于 `[showToast, post.contentHtml]`。由于这些依赖项在
  // 重新渲染后没有改变，effect 不会再次运行，导致页眉消失。
  //
  // 解决方案：通过移除依赖数组，我们确保这个 effect 在每次组件渲染后都会运行。
  // effect 内部的 `if (figure.querySelector('.code-block-header'))` 检查
  // 仍然是必要的，它可以防止在未来的某些边缘情况下（尽管在这里不太可能）
  // 重复添加页眉，这是一种健壮的防御性编程实践。
  useEffect(() => {
    if (!articleContentRef.current) return;

    const codeFigures = articleContentRef.current.querySelectorAll('figure[data-rehype-pretty-code-figure]');

    codeFigures.forEach(figure => {
      if (figure.querySelector('.code-block-header')) {
        return;
      }

      const preElement = figure.querySelector('pre');
      const codeElement = figure.querySelector('code');
      if (!preElement || !codeElement) return;

      const language = preElement.getAttribute('data-language') || '';

      // 1. 创建页眉容器
      const header = document.createElement('div');
      header.className = 'code-block-header';

      // 2. 创建语言标签
      const languageTag = document.createElement('span');
      languageTag.className = 'language-tag';
      languageTag.textContent = language;

      // 3. 创建复制按钮
      const button = document.createElement('button');
      button.className = 'copy-button';
      button.ariaLabel = '复制代码';

      const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2"></path></svg>`;
      const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      button.innerHTML = copyIconSVG + checkIconSVG;

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

      // 4. 组装页眉
      header.appendChild(languageTag);
      header.appendChild(button);

      // 5. 将完整的页眉插入到 <figure> 元素的顶部，位于 <pre> 标签之前
      figure.insertBefore(header, preElement);
    });
  }); // <-- 依赖数组被移除

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
