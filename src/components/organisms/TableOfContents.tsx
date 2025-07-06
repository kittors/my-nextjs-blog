// src/components/organisms/TableOfContents.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type TocEntry } from '@/lib/posts';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

// 核心修正：更新 Props 接口
interface TableOfContentsProps {
  headings: TocEntry[];
  isOpen: boolean;
  onClose: () => void;
  title: string; // 接收来自字典的标题文本
}

const HEADER_OFFSET = 80;

// ... (throttle and debounce functions remain the same)
const throttle = <T extends unknown[]>(callback: (...args: T) => void, delay: number) => {
  let lastCall = 0;
  return (...args: T) => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    }
  };
};
const debounce = <T extends unknown[]>(callback: (...args: T) => void, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};

/**
 * TableOfContents 组件
 * @param {TableOfContentsProps} props - 组件属性。
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, isOpen, onClose, title }) => {
  const [activeId, setActiveId] = useState<string>('');
  const isMobile = useIsMobile();
  const observer = useRef<IntersectionObserver | null>(null);
  const headingStatesRef = useRef<Map<string, boolean>>(new Map());
  const isClickScrolling = useRef(false);
  const tocListWrapperRef = useRef<HTMLDivElement | null>(null);
  const tocContainerRef = useRef<HTMLElement | null>(null);

  const throttledSetActiveId = useRef(throttle((id: string) => setActiveId(id), 300)).current;

  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (isClickScrolling.current) return;
      entries.forEach(entry => headingStatesRef.current.set(entry.target.id, entry.isIntersecting));

      let currentActiveId = '';
      let minDistanceFromRootTop = Infinity;

      for (const heading of headings) {
        if (headingStatesRef.current.get(heading.id)) {
          const targetElement = document.getElementById(heading.id);
          if (targetElement) {
            const dist = targetElement.getBoundingClientRect().top - HEADER_OFFSET;
            if (dist >= 0 && dist < minDistanceFromRootTop) {
              minDistanceFromRootTop = dist;
              currentActiveId = heading.id;
            }
          }
        }
      }

      if (!currentActiveId) {
        const intersecting = headings.filter(h => headingStatesRef.current.get(h.id));
        if (intersecting.length > 0) currentActiveId = intersecting[0].id;
      }

      if (currentActiveId) {
        throttledSetActiveId(currentActiveId);
      }
    },
    [headings, throttledSetActiveId]
  );

  useEffect(() => {
    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`,
      threshold: 0.1,
    });
    const elements = headings.map(({ id }) => document.getElementById(id)).filter(Boolean);
    elements.forEach(el => observer.current?.observe(el!));
    return () => observer.current?.disconnect();
  }, [headings, handleObserver]);

  const debouncedFinalCheck = useRef(
    debounce(() => {
      if (isClickScrolling.current) return;
      const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
      if (atBottom && headings.length > 0) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }
      let finalActiveId = '';
      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top < HEADER_OFFSET + 20) {
          finalActiveId = heading.id;
        }
      }
      if (finalActiveId) {
        setActiveId(finalActiveId);
      } else if (headings.length > 0) {
        setActiveId(headings[0].id);
      }
    }, 150)
  ).current;

  useEffect(() => {
    window.addEventListener('scroll', debouncedFinalCheck);
    return () => window.removeEventListener('scroll', debouncedFinalCheck);
  }, [debouncedFinalCheck]);

  useEffect(() => {
    if (activeId && tocListWrapperRef.current && !isClickScrolling.current) {
      const activeLink = tocListWrapperRef.current.querySelector(`a.active`) as HTMLElement | null;
      if (activeLink) {
        tocListWrapperRef.current.scrollTo({
          top: activeLink.offsetTop - tocListWrapperRef.current.clientHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [activeId]);

  useEffect(() => {
    if (activeId && !isClickScrolling.current) {
      history.replaceState(null, '', `#${activeId}`);
    }
  }, [activeId]);

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    isClickScrolling.current = true;
    setActiveId(id);
    const targetElement = document.getElementById(id);
    if (targetElement) {
      window.scrollTo({ top: targetElement.offsetTop - HEADER_OFFSET, behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    }
    if (isMobile) onClose();
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  if (headings.length === 0) {
    return isMobile ? null : <div className="hidden lg:block w-[280px] flex-shrink-0"></div>;
  }

  return (
    <>
      <div
        className={`toc-backdrop ${isMobile && isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden={!isMobile}
      />
      <aside
        className={`toc-container ${isMobile && isOpen ? 'open' : ''}`}
        ref={tocContainerRef}
        aria-hidden={!isOpen && isMobile}
      >
        <div className="toc-header-sticky">
          {/* 核心修正：使用 title prop 代替硬编码文本 */}
          <h3>{title}</h3>
          <button onClick={onClose} className="toc-close-button" aria-label="关闭大纲">
            <X size={24} />
          </button>
        </div>
        <div className="toc-list-wrapper" ref={tocListWrapperRef}>
          <ul className="toc-list">
            {headings.map(({ id, text, level }) => (
              <li key={id} className={`level-${level}`}>
                <a
                  href={`#${id}`}
                  onClick={e => handleLinkClick(e, id)}
                  className={activeId === id ? 'active' : ''}
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default TableOfContents;
