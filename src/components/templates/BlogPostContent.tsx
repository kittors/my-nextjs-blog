// src/components/templates/BlogPostContent.tsx
'use client';

// 核心修正：导入 useMemo
import React, {
  useRef,
  useState,
  createElement,
  Fragment,
  memo,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useToast } from '@/contexts/ToastContext';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import { type TocEntry } from '@/lib/posts';
import TableOfContents from '@/components/organisms/TableOfContents';
import { type Root as HastRoot } from 'hast';
import { unified } from 'unified';
import rehypeReact from 'rehype-react';
import PostImage from '@/components/atoms/PostImage';
import ImagePreview from '@/components/molecules/ImagePreview';
import LazyLoadWrapper from '@/components/atoms/LazyLoadWrapper';
import GlobalActionMenu from '@/components/molecules/GlobalActionMenu';
import BackButton from '@/components/atoms/BackButton';

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

  const handleImageClick = useCallback((src: string) => {
    setPreviewImageSrc(src);
  }, []);

  useEffect(() => {
    const articleElement = articleContentRef.current;
    if (!articleElement) return;
    const handleCopyClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const copyButton = target.closest('button[data-copy-button]');
      if (!copyButton) return;
      const figureElement = copyButton.closest('figure');
      if (!figureElement) return;
      const preElement = figureElement.querySelector('pre');
      if (!preElement) return;
      const codeToCopy = preElement.innerText || '';
      navigator.clipboard
        .writeText(codeToCopy)
        .then(() => {
          showToast('代码已复制到剪贴板', 'success');
          copyButton.setAttribute('data-copied', 'true');
          setTimeout(() => {
            copyButton.removeAttribute('data-copied');
          }, 2000);
        })
        .catch(err => {
          showToast('复制失败，请稍后重试', 'error');
          console.error('无法复制文本: ', err);
        });
    };
    articleElement.addEventListener('click', handleCopyClick);
    return () => {
      articleElement.removeEventListener('click', handleCopyClick);
    };
  }, [showToast]);

  // 核心修正：使用 useMemo 来记忆 rehype 的配置。
  // 这可以防止在父组件重新渲染时，不必要地重新创建此对象。
  const rehypeOptions = useMemo(
    () => ({
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
    }),
    [handleImageClick]
  ); // 依赖于稳定的 handleImageClick

  // 核心修正：使用 useMemo 来记忆最终的 React 元素。
  // 只有当文章内容或 rehype 配置变化时，才会重新执行昂贵的 stringify 操作。
  // 这可以防止因打开/关闭预览等不相关状态变化导致的重新渲染，从而解决闪烁问题。
  const contentReact = useMemo(() => {
    return unified()
      .use(rehypeReact, rehypeOptions as any)
      .stringify(post.content);
  }, [post.content, rehypeOptions]);

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
            <BackButton fallbackHref="/" />

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
