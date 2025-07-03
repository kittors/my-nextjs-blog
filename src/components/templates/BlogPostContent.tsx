// src/components/templates/BlogPostContent.tsx
"use client";

import React, { useRef, useEffect, memo, useState, createElement, Fragment } from 'react';
// 核心修正 1：为生产环境导入 jsx 和 jsxs
import { jsx, jsxs } from 'react/jsx-runtime';
import { useToast } from '@/contexts/ToastContext';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import Link from 'next/link';
import { type TocEntry } from '@/lib/posts';
import TableOfContents from '@/components/organisms/TableOfContents';
import BackToTopButton from '@/components/atoms/BackToTopButton';
import { type Root as HastRoot } from 'hast';
import { unified } from 'unified';
import rehypeReact from 'rehype-react';
import PostImage from '@/components/atoms/PostImage';
import ImagePreview from '@/components/molecules/ImagePreview';

interface BlogPostContentProps {
  post: {
    title: string;
    author: string;
    date: string;
    content: HastRoot; // 内容现在是 HAST 树
  };
  headings: TocEntry[];
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({ post, headings }) => {
  const articleContentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);

  // 图片点击处理函数
  const handleImageClick = (src: string) => {
    setPreviewImageSrc(src);
  };

  // 核心修正 2：将 jsx 和 jsxs 添加到 rehype-react 的配置中
  const rehypeOptions = {
    createElement,
    Fragment,
    jsx,
    jsxs,
    components: {
      img: (props: { src?: string | unknown; alt?: string }) => {
        const { src, alt } = props;
        if (typeof src === 'string') {
          return <PostImage src={src} alt={alt || ''} onClick={handleImageClick} />;
        }
        return null;
      },
    },
  };

  const contentReact = unified()
    .use(rehypeReact, rehypeOptions as any)
    .stringify(post.content);


  // 复制按钮的逻辑
  useEffect(() => {
    if (!articleContentRef.current) return;
    const codeFigures = articleContentRef.current.querySelectorAll('figure[data-rehype-pretty-code-figure]');
    codeFigures.forEach(figure => {
      const preElement = figure.querySelector('pre');
      if (!preElement) return;
      if (!figure.querySelector('.code-block-header')) {
        const language = preElement.getAttribute('data-language') || '';
        const header = document.createElement('div');
        header.className = 'code-block-header';
        const languageTag = document.createElement('span');
        languageTag.className = 'language-tag';
        languageTag.textContent = language;
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.setAttribute('aria-label', '复制代码');
        const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2"></path></svg>`;
        const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        button.innerHTML = copyIconSVG + checkIconSVG;
        header.appendChild(languageTag);
        header.appendChild(button);
        figure.insertBefore(header, preElement);
      }
      const button = figure.querySelector('.copy-button') as HTMLButtonElement | null;
      const codeElement = figure.querySelector('code');
      if (!button || !codeElement || button.dataset.listenerAttached === 'true') return;
      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(codeElement.innerText);
          showToast('代码已复制到剪贴板！', 'success');
          button.dataset.copied = 'true';
          setTimeout(() => { delete button.dataset.copied; }, 2000);
        } catch (err) {
          console.error('无法复制代码: ', err);
          showToast('复制失败，请手动复制。', 'error');
        }
      };
      button.addEventListener('click', handleCopy);
      button.dataset.listenerAttached = 'true';
    });
  }, [contentReact, showToast]); // 当内容变化时重新执行

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="blog-layout">
          <article className="max-w-3xl">
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
            >
              {contentReact}
            </div>
          </article>

          <TableOfContents headings={headings} />
        </div>
        <BackToTopButton />
      </div>
      <ImagePreview src={previewImageSrc} onClose={() => setPreviewImageSrc(null)} />
    </>
  );
};

export default memo(BlogPostContent);
