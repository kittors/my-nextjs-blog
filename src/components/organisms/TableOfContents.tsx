// src/components/organisms/TableOfContents.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type TocEntry } from '@/lib/posts';
import { X } from 'lucide-react';

// 定义组件的 Props 接口
interface TableOfContentsProps {
  headings: TocEntry[];
  isOpen: boolean; // 控制移动端抽屉是否打开
  onClose: () => void; // 关闭抽屉的回调函数
}

// 定义 Header 的高度和额外的偏移量
const HEADER_OFFSET = 80;

/**
 * TableOfContents 组件：
 * 负责渲染文章大纲，并根据用户的滚动位置动态高亮当前章节。
 * 此版本是响应式的：
 * - 桌面端：表现为固定的侧边栏。
 * - 移动端：表现为一个可开关的抽屉式侧边栏。
 * @param {TableOfContentsProps} props - 组件属性。
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, isOpen, onClose }) => {
  const [activeId, setActiveId] = useState<string>('');
  // 核心修正：引入 isMobile 状态，避免在服务端访问 window 对象
  const [isMobile, setIsMobile] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);
  const headingStatesRef = useRef<Map<string, boolean>>(new Map());
  const isClickScrolling = useRef(false);
  const tocListWrapperRef = useRef<HTMLDivElement>(null);
  const tocContainerRef = useRef<HTMLElement | null>(null);

  // 核心修正：使用 useEffect 在客户端安全地检测窗口宽度
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    // 组件挂载后立即执行一次检查
    checkDevice();
    // 监听窗口大小变化
    window.addEventListener('resize', checkDevice);
    // 组件卸载时移除监听器
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 当抽屉在移动端打开时，禁止背景页面滚动
  useEffect(() => {
    // 使用 isMobile 状态来判断
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // 组件卸载时恢复滚动
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, isMobile]); // 依赖项更新为 isMobile

  // IntersectionObserver 的回调函数，用于确定哪个标题在视口中
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

  // 设置 IntersectionObserver 并观察所有标题元素
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

  // 当 activeId 变化时，自动滚动大纲列表以确保激活项可见
  useEffect(() => {
    if (activeId && tocListWrapperRef.current && !isClickScrolling.current) {
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

  // 实时更新浏览器地址栏中的 URL 锚点（hash）
  useEffect(() => {
    if (activeId && !isClickScrolling.current) {
      const newHash = `#${activeId}`;
      if (window.location.hash !== newHash) {
        history.replaceState(null, '', newHash);
      }
    }
  }, [activeId]);

  // 处理链接点击事件，点击后在移动端关闭抽屉
  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    isClickScrolling.current = true;
    setActiveId(id);

    const targetElement = document.getElementById(id);
    if (targetElement) {
      const targetPosition = targetElement.offsetTop - HEADER_OFFSET;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      history.pushState(null, '', `#${id}`);
    }

    // 使用 isMobile 状态来判断
    if (isMobile) {
      onClose();
    }

    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={`toc-backdrop lg:hidden ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`toc-container ${isOpen ? 'open' : ''}`}
        ref={tocContainerRef}
        // 核心修正：使用 isMobile 状态来设置 aria-hidden
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
