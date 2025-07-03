// src/components/organisms/TableOfContents.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type TocEntry } from '@/lib/posts';

interface TableOfContentsProps {
  headings: TocEntry[];
}

// 定义 Header 的高度和额外的偏移量
const HEADER_OFFSET = 80;

/**
 * TableOfContents 组件：负责渲染文章大纲，并根据用户的滚动位置动态高亮当前章节。
 * 优化点：
 * 1. 当大纲列表溢出滚动时，确保当前激活的标题始终保持在可见区域内。
 * 2. `<h3>文章大纲</h3>` 固定显示在组件的顶部，且不参与列表滚动。
 * 3. 实时更新浏览器地址栏中的 URL 锚点（hash），反映当前阅读的章节。
 *
 * @param {TableOfContentsProps} props - 组件属性。
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);
  const headingStatesRef = useRef<Map<string, boolean>>(new Map());
  const isClickScrolling = useRef(false);
  const tocListWrapperRef = useRef<HTMLDivElement>(null);
  const tocContainerRef = useRef<HTMLElement>(null);

  // IntersectionObserver 的回调函数
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (isClickScrolling.current) {
        return;
      }

      entries.forEach(entry => {
        headingStatesRef.current.set(entry.target.id, entry.isIntersecting);
      });

      let currentActiveId = '';
      let minDistanceFromRootTop = Infinity;

      for (const heading of headings) {
        const isIntersecting = headingStatesRef.current.get(heading.id);
        if (isIntersecting) {
          const targetElement = document.getElementById(heading.id);
          if (targetElement) {
            const distanceFromRootTop = targetElement.getBoundingClientRect().top - HEADER_OFFSET;

            if (distanceFromRootTop >= 0 && distanceFromRootTop < minDistanceFromRootTop) {
              minDistanceFromRootTop = distanceFromRootTop;
              currentActiveId = heading.id;
            }
          }
        }
      }

      if (!currentActiveId) {
        const intersectingHeadingsInOrder = headings.filter(h =>
          headingStatesRef.current.get(h.id)
        );
        if (intersectingHeadingsInOrder.length > 0) {
          currentActiveId = intersectingHeadingsInOrder[0].id;
        }
      }

      if (currentActiveId && currentActiveId !== activeId) {
        setActiveId(currentActiveId);
      }
    },
    [headings, activeId]
  );

  // IntersectionObserver 的设置和元素观察逻辑
  useEffect(() => {
    if (!observer.current) {
      observer.current = new IntersectionObserver(handleObserver, {
        rootMargin: `-${HEADER_OFFSET}px 0px 0px 0px`,
        threshold: 0.1,
      });
    }

    const elements = headings.map(({ id }) => document.getElementById(id)).filter(Boolean);

    elements.forEach(el => observer.current?.observe(el!));

    return () => {
      if (observer.current) {
        observer.current.disconnect();
        observer.current = null;
      }
    };
  }, [headings, handleObserver]);

  // 当 activeId 变化时，滚动大纲列表以确保激活项可见
  useEffect(() => {
    if (activeId && tocListWrapperRef.current && !isClickScrolling.current) {
      // 核心修正：将 activeLink 断言为 HTMLElement 以访问 offsetTop
      const activeLink = tocListWrapperRef.current.querySelector(`a.active`) as HTMLElement | null;

      if (activeLink) {
        const stickyHeader = tocContainerRef.current?.querySelector(
          '.toc-header-sticky'
        ) as HTMLElement | null;
        const stickyHeaderHeight = stickyHeader ? stickyHeader.offsetHeight : 0;

        const elementTopInScrollContainer = activeLink.offsetTop;
        const scrollContainerHeight = tocListWrapperRef.current.clientHeight;

        const targetScrollTop =
          elementTopInScrollContainer -
          scrollContainerHeight / 2 +
          activeLink.clientHeight / 2 +
          stickyHeaderHeight;

        tocListWrapperRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [activeId]);

  // 核心优化：实时更新 URL hash
  useEffect(() => {
    // 只有当 activeId 存在，并且不是用户点击触发的滚动时才更新 URL hash
    if (activeId && !isClickScrolling.current) {
      const newHash = `#${activeId}`;
      // 使用 replaceState 而不是 pushState，避免在历史记录中创建过多条目
      if (window.location.hash !== newHash) {
        history.replaceState(null, '', newHash);
      }
    }
  }, [activeId]); // 监听 activeId 的变化

  /**
   * 处理大纲链接点击事件。
   * 阻止默认的锚点跳转行为，手动平滑滚动到目标位置，并更新 URL hash。
   * @param {React.MouseEvent} e - 点击事件对象。
   * @param {string} id - 目标元素的 ID。
   */
  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    isClickScrolling.current = true; // 标记开始点击滚动

    setActiveId(id); // 立即设置高亮状态，提供即时反馈

    const targetElement = document.getElementById(id);
    if (targetElement) {
      const targetPosition = targetElement.offsetTop - HEADER_OFFSET;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
      // 用户点击时使用 pushState，这样可以通过浏览器回退按钮回到点击前的页面位置
      history.pushState(null, '', `#${id}`);
    }

    // 在滚动动画结束后，恢复滚动监听的逻辑。
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800); // 应该略长于平滑滚动动画的持续时间
  };

  // 如果没有标题，则不渲染大纲组件
  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="toc-container hidden lg:block" ref={tocContainerRef}>
      <h3 className="toc-header-sticky">文章大纲</h3>
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
  );
};

export default TableOfContents;
