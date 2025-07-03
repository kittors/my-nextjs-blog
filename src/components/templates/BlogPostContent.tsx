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
    title?: string; // 属性变为可选
    author?: string; // 属性变为可选
    date?: string; // 属性变为可选
    content: HastRoot;
    slug: string; // 核心修正：添加 slug 属性，解决 TypeScript 错误
  };
  headings: TocEntry[];
}

// 定义一个常量来表示 Header 的高度和额外的偏移量，方便统一调整
// 这个值应与 Header 组件的实际高度以及您希望的额外间距相匹配。
const HEADER_OFFSET = 80; // 64px (h-16) for the header + 16px buffer

/**
 * BlogPostContent 组件：负责渲染单篇博客文章的完整内容。
 * 这是一个模板级别的组件，它将原子组件 (如 Heading, Text, PostImage)
 * 和分子组件 (如 ImagePreview) 组织起来，并与组织组件 (如 TableOfContents) 协作。
 * 它还处理文章内容的 Markdown 渲染、代码块复制功能、图片预览以及 URL Hash 定位。
 *
 * @param {BlogPostContentProps} props - 组件属性。
 */
const BlogPostContent: React.FC<BlogPostContentProps> = ({ post, headings }) => {
  const articleContentRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [previewImageSrc, setPreviewImageSrc] = useState<string | null>(null);

  /**
   * 处理图片点击事件，显示图片预览模态框。
   * @param {string} src - 被点击图片的源 URL。
   */
  const handleImageClick = (src: string) => {
    setPreviewImageSrc(src);
  };

  // 配置 rehype-react，用于将 HAST 树渲染为 React 元素。
  // 特别地，它会劫持 <img> 标签，用自定义的 PostImage 组件替换，以实现图片预览功能。
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

  // 使用 unified 和 rehype-react 将文章的 HAST 内容转换为 React 可渲染的 JSX。
  const contentReact = unified()
    .use(rehypeReact, rehypeOptions as any) // 'as any' 用于临时绕过 rehype-react 的类型兼容性问题
    .stringify(post.content);

  // 为文章的元数据提供默认值，以防 Markdown frontmatter 中缺少这些信息。
  const title = post.title || '无标题文章';
  const author = post.author || '匿名作者';
  const dateObj = post.date ? new Date(post.date) : null;
  const displayDate =
    dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('zh-CN') : '未知日期';

  /**
   * useEffect 钩子：处理页面加载时 URL hash 的滚动定位。
   * 当页面通过带有 hash 的 URL 加载时（例如从搜索结果或外部链接跳转），
   * 此 effect 会尝试滚动到对应的元素，并考虑固定头部的高度。
   * 使用 setTimeout 确保 DOM 和布局在滚动前稳定。
   */
  useEffect(() => {
    if (window.location.hash) {
      const encodedId = window.location.hash.substring(1); // 移除 '#'
      // 核心修正：解码 URL hash，因为 rehypeSlug 生成的 ID 是未编码的
      const id = decodeURIComponent(encodedId);
      console.log(`[BlogPostContent] URL hash detected: #${encodedId}, decoded ID: ${id}`);
      const targetElement = document.getElementById(id);
      if (targetElement) {
        console.log(`[BlogPostContent] Target element found:`, targetElement);
        // 核心修正：增加 setTimeout 延迟时间，确保页面和所有内容（包括图片等）完全渲染和水合，
        // 并且固定头部的高度已经稳定，避免计算错误。
        const timer = setTimeout(() => {
          const targetPosition = targetElement.offsetTop - HEADER_OFFSET;
          console.log(
            `[BlogPostContent] Scrolling to ID: ${id}, OffsetTop: ${targetElement.offsetTop}, Target Position: ${targetPosition}`
          );
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth',
          });
        }, 300); // 300ms 的小延迟通常足够，可以根据实际加载情况调整

        // 清理函数：在组件卸载或 effect 重新运行时清除定时器，防止内存泄漏。
        return () => clearTimeout(timer);
      } else {
        console.warn(`[BlogPostContent] Target element with ID "${id}" not found.`);
      }
    }
  }, [post.slug]); // 依赖 post.slug，当文章切换时重新运行此 effect

  /**
   * useEffect 钩子：处理代码块的复制按钮逻辑。
   * 遍历所有由 rehype-pretty-code 生成的代码块，为它们添加自定义的头部（包含语言标签和复制按钮）。
   * 监听复制按钮的点击事件，将代码内容复制到剪贴板，并显示 Toast 提示。
   */
  useEffect(() => {
    if (!articleContentRef.current) return; // 确保文章内容容器已挂载

    // 查找所有由 rehype-pretty-code 插件生成的代码块容器 (figure 元素)。
    const codeFigures = articleContentRef.current.querySelectorAll(
      'figure[data-rehype-pretty-code-figure]'
    );

    codeFigures.forEach(figure => {
      const preElement = figure.querySelector('pre');
      if (!preElement) return; // 确保 pre 标签存在

      // 如果代码块头部不存在，则创建并插入。
      if (!figure.querySelector('.code-block-header')) {
        const language = preElement.getAttribute('data-language') || ''; // 获取代码语言
        const header = document.createElement('div');
        header.className = 'code-block-header'; // 应用样式类名

        const languageTag = document.createElement('span');
        languageTag.className = 'language-tag';
        languageTag.textContent = language; // 显示代码语言

        const button = document.createElement('button');
        button.className = 'copy-button';
        button.setAttribute('aria-label', '复制代码');

        // 复制和勾选图标的 SVG 字符串。
        const copyIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v2"></path></svg>`;
        const checkIconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="check-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        button.innerHTML = copyIconSVG + checkIconSVG; // 将图标插入按钮

        header.appendChild(languageTag);
        header.appendChild(button);
        figure.insertBefore(header, preElement); // 将头部插入到 pre 标签之前
      }

      // 获取复制按钮和代码元素。
      const button = figure.querySelector('.copy-button') as HTMLButtonElement | null;
      const codeElement = figure.querySelector('code');

      // 避免重复绑定事件监听器。
      if (!button || !codeElement || button.dataset.listenerAttached === 'true') return;

      /**
       * 处理复制操作的异步函数。
       * 尝试将代码内容复制到剪贴板，并根据结果显示 Toast 提示。
       */
      const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(codeElement.innerText); // 复制文本
          showToast('代码已复制到剪贴板！', 'success'); // 显示成功提示
          button.dataset.copied = 'true'; // 设置 data 属性以切换图标
          setTimeout(() => {
            delete button.dataset.copied; // 2 秒后恢复复制图标
          }, 2000);
        } catch (err) {
          console.error('无法复制代码: ', err); // 打印错误信息
          showToast('复制失败，请手动复制。', 'error'); // 显示失败提示
        }
      };

      button.addEventListener('click', handleCopy); // 绑定点击事件
      button.dataset.listenerAttached = 'true'; // 标记已绑定监听器
    });
  }, [contentReact, showToast]); // 依赖 contentReact (当内容变化时重新运行) 和 showToast (确保函数稳定)

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="blog-layout">
          <article className="max-w-3xl">
            {/* 返回所有文章的链接 */}
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

            {/* 文章标题 */}
            <Heading level={1} className="text-4xl font-extrabold text-neutral-900 mb-4">
              {title}
            </Heading>

            {/* 文章元信息：作者和日期 */}
            <div className="text-neutral-500 text-sm mb-8 border-b border-neutral-200 pb-4">
              <Text as="span" className="mr-4">
                作者: {author}
              </Text>
              <Text as="span">日期: {displayDate}</Text>
            </div>

            {/* 文章内容区域，使用 ref 方便 DOM 操作 */}
            <div
              ref={articleContentRef}
              className="prose prose-lg max-w-none text-neutral-800 leading-relaxed"
            >
              {contentReact}
            </div>
          </article>

          {/* 文章大纲侧边栏 */}
          <TableOfContents headings={headings} />
        </div>
        {/* 回到顶部按钮 */}
        <BackToTopButton />
      </div>
      {/* 图片预览模态框 */}
      <ImagePreview src={previewImageSrc} onClose={() => setPreviewImageSrc(null)} />
    </>
  );
};

export default memo(BlogPostContent);
