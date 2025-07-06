// src/components/templates/BlogPostContent.tsx
'use client';

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
import { type BlogPost, type TocEntry } from '@/lib/posts';
import TableOfContents from '@/components/organisms/TableOfContents';
import { unified } from 'unified';
import rehypeReact, { type Options as RehypeReactOptions } from 'rehype-react';
import PostImage from '@/components/atoms/PostImage';
import ImagePreview from '@/components/molecules/ImagePreview';
import LazyLoadWrapper from '@/components/atoms/LazyLoadWrapper';
import GlobalActionMenu from '@/components/molecules/GlobalActionMenu';
import BackButton from '@/components/atoms/BackButton';
// 核心修正：从 src/lib/config 导入 Locale 类型
import { type Locale } from '@/lib/config';

// 核心修正：更新 Props 接口
interface BlogPostContentProps {
  post: BlogPost;
  headings: TocEntry[];
  dynamicFallbackHref: string;
  dictionary: {
    // 明确接收字典对象
    back_button: string;
    toc_title: string;
  };
  lang: Locale; // 明确接收当前语言
  postContentDictionary: {
    // 核心新增：接收 post_content 字典
    author_label: string;
    date_label: string;
    unknown_date: string;
  };
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({
  post,
  headings,
  dynamicFallbackHref,
  dictionary, // 使用字典
  lang,
  postContentDictionary, // 核心新增：使用 postContentDictionary
}) => {
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
  );

  const contentReact = useMemo(() => {
    return unified()
      .use(rehypeReact, rehypeOptions as RehypeReactOptions)
      .stringify(post.content);
  }, [post.content, rehypeOptions]);

  const title = post.title || '无标题文章';
  const author = post.author || '匿名作者';
  const dateObj = post.date ? new Date(post.date) : null;
  // 核心修正：使用 postContentDictionary 中的文本作为未知日期的占位符
  const displayDate =
    dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString(lang)
      : postContentDictionary.unknown_date;

  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="blog-layout">
          <article className="w-full max-w-3xl">
            {/* 核心修正：将字典文本传递给 BackButton */}
            <BackButton fallbackHref={dynamicFallbackHref} label={dictionary.back_button} />

            <Heading level={1} className="text-4xl font-extrabold text-neutral-900 mb-4">
              {title}
            </Heading>

            <div className="text-neutral-500 text-sm mb-8 border-b border-neutral-200 pb-4">
              <Text as="span" className="mr-4">
                {/* 核心修正：使用 postContentDictionary 中的文本 */}
                {postContentDictionary.author_label}: {author}
              </Text>
              <Text as="span">
                {/* 核心修正：使用 postContentDictionary 中的文本 */}
                {postContentDictionary.date_label}: {displayDate}
              </Text>
            </div>

            <div
              ref={articleContentRef}
              className="prose prose-lg max-w-none text-neutral-800 leading-relaxed"
            >
              {contentReact}
            </div>
          </article>

          {/* 核心修正：将字典文本传递给 TableOfContents */}
          <TableOfContents
            headings={headings}
            isOpen={isTocOpen}
            onClose={() => setIsTocOpen(false)}
            title={dictionary.toc_title}
          />
        </div>
      </div>

      <GlobalActionMenu onToggleToc={() => setIsTocOpen(!isTocOpen)} />
      <ImagePreview src={previewImageSrc} onClose={() => setPreviewImageSrc(null)} />
    </>
  );
};

export default memo(BlogPostContent);
