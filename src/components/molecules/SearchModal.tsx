// src/components/molecules/SearchModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BlogPostMetadata } from '@/lib/posts'; // 导入文章元数据类型

// 定义搜索结果的接口
interface SearchResult extends BlogPostMetadata {
  excerpt: string; // 搜索结果的摘要
  highlightedTitle: string; // 高亮后的标题
  highlightedExcerpt: string; // 高亮后的摘要
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 核心修改：接收所有文章的元数据和纯文本内容，用于客户端搜索
  postsData: {
    metadata: BlogPostMetadata;
    plainTextContent: string;
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
 * @param {Array<{ metadata: BlogPostMetadata; plainTextContent: string }>} props.postsData - 所有文章的元数据和纯文本内容。
 */
const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, postsData }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1); // 用于键盘导航
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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

    const lowerCaseQuery = query.toLowerCase();
    const filteredResults: SearchResult[] = [];

    postsData.forEach(post => {
      const { metadata, plainTextContent } = post;
      const lowerCaseTitle = metadata.title.toLowerCase();
      const lowerCaseContent = plainTextContent.toLowerCase();

      let match = false;
      let excerpt = metadata.description; // 默认使用描述作为摘要
      let highlightedTitle = metadata.title;
      let highlightedExcerpt = metadata.description;

      // 检查标题是否匹配
      if (lowerCaseTitle.includes(lowerCaseQuery)) {
        match = true;
        highlightedTitle = metadata.title.replace(
          new RegExp(query, 'gi'),
          match => `<mark>${match}</mark>`
        );
      }

      // 检查内容是否匹配
      if (lowerCaseContent.includes(lowerCaseQuery)) {
        match = true;
        // 找到第一个匹配项的索引
        const startIndex = lowerCaseContent.indexOf(lowerCaseQuery);
        // 提取匹配项前后的一段内容作为摘要
        const contextLength = 80; // 摘要长度
        const start = Math.max(0, startIndex - contextLength / 2);
        const end = Math.min(
          plainTextContent.length,
          startIndex + lowerCaseQuery.length + contextLength / 2
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
      }

      if (match) {
        filteredResults.push({
          ...metadata,
          excerpt: excerpt,
          highlightedTitle: highlightedTitle,
          highlightedExcerpt: highlightedExcerpt,
        });
      }
    });

    setResults(filteredResults);
    setActiveIndex(-1); // 重置活跃索引
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
            router.push(`/blog/${results[activeIndex].slug}`);
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
    [isOpen, activeIndex, results, onClose, router]
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
                href={`/blog/${result.slug}`}
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
