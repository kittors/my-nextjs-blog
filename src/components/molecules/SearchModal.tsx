// src/components/molecules/SearchModal.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BlogPostMetadata, TocEntry } from '@/lib/posts';
import NProgress from 'nprogress';

// 定义搜索结果的接口
interface SearchResult extends BlogPostMetadata {
  excerpt: string;
  highlightedTitle: string;
  highlightedExcerpt: string;
  headings: TocEntry[];
  matchedOffset?: number;
}

// 核心修正：更新 Props 接口以接收一个字典对象。
// 这解决了父组件 PageContainer 传递未定义 prop 的 TypeScript 错误，
// 并使该组件能够显示国际化的文本。
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  postsData: {
    metadata: BlogPostMetadata;
    plainTextContent: string;
    headings: TocEntry[];
  }[];
  dictionary: {
    placeholder: string;
    no_results: string;
  };
}

/**
 * SearchModal 组件：提供一个模态框，包含搜索输入框和实时搜索结果列表。
 *
 * @param {SearchModalProps} props - 组件属性。
 */
const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, postsData, dictionary }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getTargetHash = useCallback((result: SearchResult): string => {
    let targetHash = '';
    if (typeof result.matchedOffset === 'number' && result.headings.length > 0) {
      const relevantHeadings = result.headings.filter(h => h.offset <= result.matchedOffset!);

      if (relevantHeadings.length > 0) {
        const closestHeading = relevantHeadings.reduce((prev, current) =>
          prev.offset > current.offset ? prev : current
        );
        targetHash = `#${closestHeading.id}`;
      } else {
        targetHash = `#${result.headings[0].id}`;
      }
    } else if (result.headings.length > 0) {
      targetHash = `#${result.headings[0].id}`;
    }
    return targetHash;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setActiveIndex(-1);
      return;
    }

    inputRef.current?.focus();

    if (query.trim() === '') {
      setResults([]);
      return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filteredResults: SearchResult[] = [];

    postsData.forEach(post => {
      const { metadata, plainTextContent, headings } = post;
      const lowerCaseTitle = metadata.title.toLowerCase();
      const lowerCaseContent = plainTextContent.toLowerCase();

      let match = false;
      let excerpt = metadata.description;
      let highlightedTitle = metadata.title;
      let highlightedExcerpt = metadata.description;
      let matchedOffset: number | undefined;

      if (lowerCaseTitle.includes(lowerCaseQuery)) {
        match = true;
        highlightedTitle = metadata.title.replace(
          new RegExp(query, 'gi'),
          match => `<mark>${match}</mark>`
        );
        matchedOffset = 0;
      }

      const contentMatchIndex = lowerCaseContent.indexOf(lowerCaseQuery);
      if (contentMatchIndex !== -1) {
        match = true;
        matchedOffset = contentMatchIndex;

        const contextLength = 80;
        const start = Math.max(0, contentMatchIndex - contextLength / 2);
        const end = Math.min(
          plainTextContent.length,
          contentMatchIndex + lowerCaseQuery.length + contextLength / 2
        );
        excerpt = plainTextContent.substring(start, end);

        if (start > 0) {
          excerpt = '...' + excerpt;
        }
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
          headings: headings,
          matchedOffset: matchedOffset,
        });
      }
    });

    setResults(filteredResults);
    setActiveIndex(-1);
  }, [query, postsData, isOpen]);

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
            const targetHash = getTargetHash(result);
            const destination = `/blog/${result.slug}${targetHash}`;

            NProgress.start();
            router.push(destination);
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
    [isOpen, activeIndex, results, onClose, router, getTargetHash]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    if (activeIndex !== -1 && resultsRef.current) {
      const activeElement = resultsRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className={`search-modal-backdrop ${isOpen ? 'visible' : ''}`} onClick={onClose}>
      <div className="search-modal-content" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={20} className="text-neutral-500" />
          <input
            ref={inputRef}
            type="text"
            // 核心修正：使用来自字典的占位符文本
            placeholder={dictionary.placeholder}
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
                href={`/blog/${result.slug}${getTargetHash(result)}`}
                onClick={onClose}
                className={`search-result-item ${index === activeIndex ? 'active' : ''}`}
              >
                <h3
                  className="search-result-title"
                  dangerouslySetInnerHTML={{
                    __html: result.highlightedTitle.replace(/"/g, '&quot;'),
                  }}
                />
                <p
                  className="search-result-excerpt"
                  dangerouslySetInnerHTML={{
                    __html: result.highlightedExcerpt.replace(/"/g, '&quot;'),
                  }}
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
            {/* 核心修正：使用来自字典的“无结果”文本，并替换查询变量 */}
            <p>{dictionary.no_results.replace('{query}', query)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchModal;
