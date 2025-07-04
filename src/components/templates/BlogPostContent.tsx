// src/components/templates/BlogPostContent.tsx
'use client';

import React, { useRef, useEffect, memo, useState, createElement, Fragment } from 'react';
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
import LazyLoadWrapper from '@/components/atoms/LazyLoadWrapper'; // 核心修正：导入新的懒加载组件

/**
 * BlogPostContentProps 接口定义了 BlogPostContent 组件的属性。
 * @property {object} post - 博客文章的数据，包含标题、作者、日期、内容和 slug。
 * @property {string} [post.title] - 文章标题，可选。
 * @property {string} [post.author] - 文章作者，可选。
 * @property {string} [post.date] - 文章发布日期，可选。
 * @property {HastRoot} post.content - 文章的 HAST 抽象语法树内容。
 * @property {string} post.slug - 文章的唯一标识符（slug），用于 URL 和内部定位。
 * @property {TocEntry[]} headings - 文章的标题大纲列表，用于目录导航。
 */
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

const HEADER_OFFSET = 80;

/**
 * BlogPostContent 组件：负责渲染单篇博客文章的完整内容。
 *
 * @param {BlogPostContentProps} props - 组件属性。
 */
const BlogPostContent: React.FC<BlogPostContentProps> = ({ post, headings }) => {
  const articleContentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);

  const handleImageClick = (src: string) => {
    setPreviewImageSrc(src);
  };

  // 核心修正：更新 rehype-react 的配置，用 LazyLoadWrapper 包裹 PostImage 组件。
  // 这样，每个图片都会被懒加载，只有当它滚动到视口附近时才会被渲染和加载。
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
        return null; // 如果 src 无效，则不渲染任何内容
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

  useEffect(() => {
    if (window.location.hash) {
      const encodedId = window.location.hash.substring(1);
      const id = decodeURIComponent(encodedId);
      const targetElement = document.getElementById(id);
      if (targetElement) {
        const timer = setTimeout(() => {
          const targetPosition = targetElement.offsetTop - HEADER_OFFSET;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [post.slug]);

  useEffect(() => {
    if (!articleContentRef.current) return;

    const codeFigures = articleContentRef.current.querySelectorAll(
      'figure[data-rehype-pretty-code-figure]'
    );

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
          setTimeout(() => {
            delete button.dataset.copied;
          }, 2000);
        } catch (err) {
          console.error('无法复制代码: ', err);
          showToast('复制失败，请手动复制。', 'error');
        }
      };

      button.addEventListener('click', handleCopy);
      button.dataset.listenerAttached = 'true';
    });
  }, [contentReact, showToast]);

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="blog-layout">
          <article className="max-w-3xl">
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

          <TableOfContents headings={headings} />
        </div>
        <BackToTopButton />
      </div>
      <ImagePreview src={previewImageSrc} onClose={() => setPreviewImageSrc(null)} />
    </>
  );
};

export default memo(BlogPostContent);
