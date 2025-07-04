// src/components/templates/BlogPostContent.tsx
'use client';

import React, { useRef, useState, createElement, Fragment, memo, useEffect } from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useToast } from '@/contexts/ToastContext';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import Link from 'next/link';
import { type TocEntry } from '@/lib/posts';
import TableOfContents from '@/components/organisms/TableOfContents';
import { type Root as HastRoot } from 'hast';
import { unified } from 'unified';
import rehypeReact from 'rehype-react';
import PostImage from '@/components/atoms/PostImage';
import ImagePreview from '@/components/molecules/ImagePreview';
import LazyLoadWrapper from '@/components/atoms/LazyLoadWrapper';
import GlobalActionMenu from '@/components/molecules/GlobalActionMenu';

interface BlogPostContentProps {
  post: {
    title?: string;
    author?: string;
    date?: string;
    content: HastRoot;
    slug: string;
  };
  headings: TocEntry[];
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({ post, headings }) => {
  const articleContentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);
  const [isTocOpen, setIsTocOpen] = useState(false);

  const handleImageClick = (src: string) => {
    setPreviewImageSrc(src);
  };

  // 核心新增：处理代码复制的副作用钩子
  useEffect(() => {
    const articleElement = articleContentRef.current;
    if (!articleElement) return;

    // 使用事件委托来处理所有复制按钮的点击事件
    const handleCopyClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // 找到被点击的、或其父元素是复制按钮的元素
      const copyButton = target.closest('button[data-copy-button]');

      if (!copyButton) return;

      // 从按钮向上找到整个代码块的 figure 容器
      const figureElement = copyButton.closest('figure');
      if (!figureElement) return;

      // 在 figure 容器内找到 pre 标签
      const preElement = figureElement.querySelector('pre');
      if (!preElement) return;

      // 获取 pre 标签内的纯文本内容
      const codeToCopy = preElement.innerText || '';

      // 使用浏览器 Clipboard API 进行复制
      navigator.clipboard
        .writeText(codeToCopy)
        .then(() => {
          // 成功后显示提示
          showToast('代码已复制到剪贴板', 'success');
          // 设置按钮状态为“已复制”，CSS 会根据此属性切换图标
          copyButton.setAttribute('data-copied', 'true');
          // 2秒后恢复按钮状态
          setTimeout(() => {
            copyButton.removeAttribute('data-copied');
          }, 2000);
        })
        .catch(err => {
          // 失败后显示错误提示
          showToast('复制失败，请稍后重试', 'error');
          console.error('无法复制文本: ', err);
        });
    };

    articleElement.addEventListener('click', handleCopyClick);

    // 组件卸载时清理事件监听器
    return () => {
      articleElement.removeEventListener('click', handleCopyClick);
    };
  }, [showToast]); // 依赖项包含 showToast，确保其在闭包中始终是最新的

  const rehypeOptions = {
    createElement,
    Fragment,
    jsx,
    jsxs,
    components: {
      img: (props: { src?: string | unknown; alt?: string }) => {
        const { src, alt } = props;
        if (typeof src === 'string') {
          return (
            <LazyLoadWrapper placeholderHeight="450px" rootMargin="200px">
              <PostImage src={src} alt={alt || ''} onClick={handleImageClick} />
            </LazyLoadWrapper>
          );
        }
        return null;
      },
    },
  };

  const contentReact = unified()
    .use(rehypeReact, rehypeOptions as any)
    .stringify(post.content);

  const title = post.title || '无标题文章';
  const author = post.author || '匿名作者';
  const dateObj = post.date ? new Date(post.date) : null;
  const displayDate =
    dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('zh-CN') : '未知日期';

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="blog-layout">
          <article className="w-full max-w-3xl">
            <Link
              href="/"
              className="text-primary hover:underline mb-8 inline-block flex items-center group"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                ></path>
              </svg>
              返回所有文章
            </Link>

            <Heading level={1} className="text-4xl font-extrabold text-neutral-900 mb-4">
              {title}
            </Heading>

            <div className="text-neutral-500 text-sm mb-8 border-b border-neutral-200 pb-4">
              <Text as="span" className="mr-4">
                作者: {author}
              </Text>
              <Text as="span">日期: {displayDate}</Text>
            </div>

            <div
              ref={articleContentRef}
              className="prose prose-lg max-w-none text-neutral-800 leading-relaxed"
            >
              {contentReact}
            </div>
          </article>

          <TableOfContents
            headings={headings}
            isOpen={isTocOpen}
            onClose={() => setIsTocOpen(false)}
          />
        </div>
      </div>

      <GlobalActionMenu onToggleToc={() => setIsTocOpen(!isTocOpen)} />
      <ImagePreview src={previewImageSrc} onClose={() => setPreviewImageSrc(null)} />
    </>
  );
};

export default memo(BlogPostContent);
