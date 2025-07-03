// src/components/molecules/SearchModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BlogPostMetadata, TocEntry } from '@/lib/posts'; // 核心修正：导入 TocEntry

// 定义搜索结果的接口
interface SearchResult extends BlogPostMetadata {
  excerpt: string; // 搜索结果的摘要
  highlightedTitle: string; // 高亮后的标题
  highlightedExcerpt: string; // 高亮后的摘要
  headings: TocEntry[]; // 核心修正：添加 headings (现在包含 offset)
  matchedOffset?: number; // 新增：匹配文本在 plainTextContent 中的起始偏移量
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 核心修改：接收所有文章的元数据、纯文本内容和标题大纲
  postsData: {
    metadata: BlogPostMetadata;
    plainTextContent: string;
    headings: TocEntry[]; // 核心修正：更新类型
  }[];
}

/**
 * SearchModal 组件：一个分子级别的 UI 组件。
 * 它提供一个模态框，包含搜索输入框和实时搜索结果列表。
 * 支持键盘导航、高亮匹配内容，并能在点击结果后跳转到文章。
 *
 * @param {SearchModalProps} props - 组件属性。
 * @param {boolean} props.isOpen - 控制模态框的显示与隐藏。
 * @param {() => void} props.onClose - 关闭模态框的回调函数。
 * @param {Array<{ metadata: BlogPostMetadata; plainTextContent: string; headings: TocEntry[] }>} props.postsData - 所有文章的元数据、纯文本内容和标题大纲。
 */
const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, postsData }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1); // 用于键盘导航
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /**
   * 辅助函数：根据匹配偏移量和文章标题列表计算出最合适的跳转 hash。
   * 会寻找距离匹配点最近且在其之前的标题。
   * @param {SearchResult} result - 单个搜索结果对象。
   * @returns {string} 目标 URL hash (例如: '#section-id')。
   */
  const getTargetHash = useCallback((result: SearchResult): string => {
    let targetHash = '';
    if (typeof result.matchedOffset === 'number' && result.headings.length > 0) {
      // 找到所有偏移量小于或等于匹配偏移量的标题
      const relevantHeadings = result.headings.filter(h => h.offset <= result.matchedOffset!);
      console.log(
        `[SearchModal - getTargetHash] Matched Offset: ${result.matchedOffset}, All Headings:`,
        result.headings
      );
      console.log(
        `[SearchModal - getTargetHash] Relevant Headings (offset <= matchedOffset):`,
        relevantHeadings
      );

      if (relevantHeadings.length > 0) {
        // 找到其中偏移量最大的标题（即最接近匹配位置的标题）
        // 使用 reduce 确保找到最接近的标题
        const closestHeading = relevantHeadings.reduce((prev, current) =>
          prev.offset > current.offset ? prev : current
        );
        targetHash = `#${closestHeading.id}`;
        console.log(
          `[SearchModal - getTargetHash] Closest Heading Selected: ID=${closestHeading.id}, Text="${closestHeading.text}", Offset=${closestHeading.offset}`
        );
      } else {
        // 如果没有找到更近的标题（例如，匹配内容在第一个标题之前），回退到第一个标题
        targetHash = `#${result.headings[0].id}`;
        console.log(
          `[SearchModal - getTargetHash] No relevant heading found, falling back to first heading: ID=${result.headings[0].id}`
        );
      }
    } else if (result.headings.length > 0) {
      // 如果没有 matchedOffset（例如，只有标题匹配），则默认跳转到第一个标题
      targetHash = `#${result.headings[0].id}`;
      console.log(
        `[SearchModal - getTargetHash] No matchedOffset, defaulting to first heading: ID=${result.headings[0].id}`
      );
    }
    return targetHash;
  }, []); // useCallback 依赖项为空，因为内部只依赖传入的 result 对象

  // 搜索逻辑：在 query 或 postsData 变化时执行搜索
  useEffect(() => {
    if (!isOpen) {
      // 模态框关闭时重置状态
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    // 模态框打开时自动聚焦输入框
    inputRef.current?.focus();

    if (query.trim() === '') {
      setResults([]);
      return;
    }

    console.log(`[SearchModal] Searching for: "${query}"`);
    const lowerCaseQuery = query.toLowerCase();
    const filteredResults: SearchResult[] = [];

    postsData.forEach(post => {
      const { metadata, plainTextContent, headings } = post;
      console.log(`[SearchModal] Processing post: "${metadata.title}" (slug: ${metadata.slug})`);
      console.log(`[SearchModal] Post headings received for "${metadata.title}":`, headings); // 确认接收到的 headings 数据

      const lowerCaseTitle = metadata.title.toLowerCase();
      const lowerCaseContent = plainTextContent.toLowerCase();

      let match = false;
      let excerpt = metadata.description; // 默认使用描述作为摘要
      let highlightedTitle = metadata.title;
      let highlightedExcerpt = metadata.description;
      let matchedOffset: number | undefined; // 存储匹配的偏移量

      // 检查标题是否匹配
      if (lowerCaseTitle.includes(lowerCaseQuery)) {
        match = true;
        highlightedTitle = metadata.title.replace(
          new RegExp(query, 'gi'),
          match => `<mark>${match}</mark>`
        );
        // 如果标题匹配，则将匹配偏移量设置为 0 (文章开头)
        matchedOffset = 0;
        console.log(`[SearchModal] Title match in "${metadata.title}", slug: ${metadata.slug}`);
      }

      // 检查内容是否匹配
      const contentMatchIndex = lowerCaseContent.indexOf(lowerCaseQuery);
      if (contentMatchIndex !== -1) {
        match = true;
        matchedOffset = contentMatchIndex; // 记录内容匹配的偏移量

        // 提取匹配项前后的一段内容作为摘要
        const contextLength = 80; // 摘要长度
        const start = Math.max(0, contentMatchIndex - contextLength / 2);
        const end = Math.min(
          plainTextContent.length,
          contentMatchIndex + lowerCaseQuery.length + contextLength / 2
        );
        excerpt = plainTextContent.substring(start, end);

        // 如果摘要不是从开头开始，则添加省略号
        if (start > 0) {
          excerpt = '...' + excerpt;
        }
        // 如果摘要不是到结尾结束，则添加省略号
        if (end < plainTextContent.length) {
          excerpt = excerpt + '...';
        }

        highlightedExcerpt = excerpt.replace(
          new RegExp(query, 'gi'),
          match => `<mark>${match}</mark>`
        );
        console.log(
          `[SearchModal] Content match in "${metadata.title}", slug: ${metadata.slug}, matchedOffset: ${matchedOffset}`
        );
      }

      if (match) {
        filteredResults.push({
          ...metadata,
          excerpt: excerpt,
          highlightedTitle: highlightedTitle,
          highlightedExcerpt: highlightedExcerpt,
          headings: headings,
          matchedOffset: matchedOffset, // 传递匹配的偏移量
        });
      }
    });

    setResults(filteredResults);
    setActiveIndex(-1); // 重置活跃索引
    console.log(`[SearchModal] Filtered results count: ${filteredResults.length}`);
  }, [query, postsData, isOpen]);

  // 键盘事件处理
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prevIndex => (prevIndex > 0 ? prevIndex - 1 : results.length - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prevIndex => (prevIndex < results.length - 1 ? prevIndex + 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex !== -1 && results[activeIndex]) {
            const result = results[activeIndex];
            const targetHash = getTargetHash(result); // 使用辅助函数获取 hash

            console.log(`[SearchModal] Navigating to: /blog/${result.slug}${targetHash}`);
            router.push(`/blog/${result.slug}${targetHash}`);
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
        default:
          break;
      }
    },
    [isOpen, activeIndex, results, onClose, router, getTargetHash] // 依赖 getTargetHash
  );

  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 滚动到活跃结果
  useEffect(() => {
    if (activeIndex !== -1 && resultsRef.current) {
      const activeElement = resultsRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeIndex]);

  // 核心修改：如果模态框不打开，则不渲染任何内容
  if (!isOpen) return null;

  return (
    // 核心修改：根据 isOpen 状态动态添加 'visible' 类
    <div className={`search-modal-backdrop ${isOpen ? 'visible' : ''}`} onClick={onClose}>
      <div className="search-modal-content" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={20} className="text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            placeholder="搜索文章内容..."
            className="search-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="search-close-button" aria-label="关闭搜索">
            <X size={20} />
          </button>
        </div>

        {results.length > 0 && (
          <div className="search-results" ref={resultsRef}>
            {results.map((result, index) => (
              <Link
                key={result.slug}
                // 核心修正：根据搜索结果的 headings 构建跳转链接
                href={`/blog/${result.slug}${getTargetHash(result)}`} // 使用辅助函数获取 hash
                onClick={onClose}
                className={`search-result-item ${index === activeIndex ? 'active' : ''}`}
              >
                <h3
                  className="search-result-title"
                  dangerouslySetInnerHTML={{ __html: result.highlightedTitle }}
                />
                <p
                  className="search-result-excerpt"
                  dangerouslySetInnerHTML={{ __html: result.highlightedExcerpt }}
                />
                <span className="search-result-meta">
                  {result.author} - {new Date(result.date).toLocaleDateString('zh-CN')}
                </span>
              </Link>
            ))}
          </div>
        )}

        {query.trim() !== '' && results.length === 0 && (
          <div className="search-no-results">
            <p>没有找到与 "{query}" 相关的文章。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
