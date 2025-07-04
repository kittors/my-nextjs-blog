// src/components/organisms/TableOfContents.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type TocEntry } from '@/lib/posts';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile'; // 核心：导入 useIsMobile hook

// 定义组件的 Props 接口
interface TableOfContentsProps {
  headings: TocEntry[];
  isOpen: boolean; // 控制移动端抽屉是否打开
  onClose: () => void; // 关闭抽屉的回调函数
}

const HEADER_OFFSET = 80;

/**
 * TableOfContents 组件（已重构）：
 * 负责渲染文章大纲，并根据用户的滚动位置动态高亮当前章节。
 * 此版本是完全响应式的：
 * - PC 端：表现为固定的粘性侧边栏，永久可见。
 * - 移动端：表现为一个可开关的抽屉式侧边栏。
 * @param {TableOfContentsProps} props - 组件属性。
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, isOpen, onClose }) => {
  const [activeId, setActiveId] = useState<string>('');
  const isMobile = useIsMobile(); // 核心：使用 hook 判断设备类型
  const observer = useRef<IntersectionObserver | null>(null);
  const headingStatesRef = useRef<Map<string, boolean>>(new Map());
  const isClickScrolling = useRef(false);
  const tocListWrapperRef = useRef<HTMLDivElement>(null);
  const tocContainerRef = useRef<HTMLElement | null>(null);

  // 当抽屉在移动端打开时，禁止背景页面滚动
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

  // IntersectionObserver 的回调函数，用于确定哪个标题在视口中
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

      if (currentActiveId && currentActiveId !== activeId) setActiveId(currentActiveId);
    },
    [headings, activeId]
  );

  // 设置 IntersectionObserver 并观察所有标题元素
  useEffect(() => {
    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`,
      threshold: 0.1,
    });
    const elements = headings.map(({ id }) => document.getElementById(id)).filter(Boolean);
    elements.forEach(el => observer.current?.observe(el!));
    return () => observer.current?.disconnect();
  }, [headings, handleObserver]);

  // 当 activeId 变化时，自动滚动大纲列表以确保激活项可见
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

  // 实时更新浏览器地址栏中的 URL 锚点（hash）
  useEffect(() => {
    if (activeId && !isClickScrolling.current) {
      history.replaceState(null, '', `#${activeId}`);
    }
  }, [activeId]);

  // 处理链接点击事件
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

  // 核心修正：如果是在 PC 端，且没有标题，则不渲染任何东西
  if (headings.length === 0 && !isMobile) {
    return <div className="hidden lg:block w-[280px] flex-shrink-0"></div>;
  }
  // 如果在移动端，且没有标题，也不渲染
  if (headings.length === 0) return null;

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
          <h3>文章大纲</h3>
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
