// src/components/templates/BlogPostContent.tsx
'use client';

import React, { useRef, useState, createElement, Fragment, memo } from 'react';
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
      {/* 主内容区域 */}
      <div className="container mx-auto px-4 py-12">
        {/* 核心重构：blog-layout 现在包含文章和 TOC，以便在 PC 端实现侧边栏布局 */}
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

          {/* 核心重构：TOC 组件现在是 blog-layout 的一部分。
              在移动端，它仍然表现为 fixed 定位的抽屉。
              在 PC 端，它将作为粘性侧边栏存在于布局流中。
           */}
          <TableOfContents
            headings={headings}
            isOpen={isTocOpen}
            onClose={() => setIsTocOpen(false)}
          />
        </div>
      </div>

      {/* 全局组件保持在布局之外 */}
      <GlobalActionMenu onToggleToc={() => setIsTocOpen(!isTocOpen)} />
      <ImagePreview src={previewImageSrc} onClose={() => setPreviewImageSrc(null)} />
    </>
  );
};

export default memo(BlogPostContent);
