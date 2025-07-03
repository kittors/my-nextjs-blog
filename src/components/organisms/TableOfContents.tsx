// src/components/organisms/TableOfContents.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { type TocEntry } from '@/lib/posts';

interface TableOfContentsProps {
  headings: TocEntry[];
}

// 定义一个常量来表示 Header 的高度和额外的偏移量，方便统一调整
const HEADER_OFFSET = 80; // 64px (h-16) for the header + 16px buffer

/**
 * TableOfContents 组件：一个组织级别的组件。
 * 它负责渲染文章大纲，并根据用户的滚动位置动态高亮当前章节。
 * @param {TableOfContentsProps} props - 组件属性。
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);
  // 新增一个 ref 来标记是否是用户点击触发的滚动，以避免冲突
  const isClickScrolling = useRef(false);

  // 滚动和高亮逻辑
  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      // 如果是用户点击触发的滚动，则暂时不处理滚动监听，避免状态覆盖
      if (isClickScrolling.current) {
        return;
      }

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    // 优化 rootMargin：
    // top: -HEADER_OFFSET -> 确保标题在 Header 下方时才被视为“进入”视口
    // bottom: -40% -> 缩小底部检测区域，让高亮更集中在屏幕中上部
    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: `-${HEADER_OFFSET}px 0px -40% 0px`,
    });

    const elements = headings.map(({ id }) => document.getElementById(id)).filter(Boolean);
    elements.forEach(el => observer.current?.observe(el!));

    return () => observer.current?.disconnect();
  }, [headings]);

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    isClickScrolling.current = true; // 标记开始点击滚动

    // 核心修正 1: 立即设置高亮状态，提供即时反馈
    setActiveId(id);

    const targetElement = document.getElementById(id);
    if (targetElement) {
      // 核心修正 2: 精确计算滚动位置，减去 Header 的高度和偏移量
      const targetPosition = targetElement.offsetTop - HEADER_OFFSET;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
      history.pushState(null, '', `#${id}`);
    }

    // 在滚动动画结束后，恢复滚动监听的逻辑
    // 这个延时确保了平滑滚动有足够的时间完成，避免了 observer 立即覆盖点击设置的状态
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="toc-container hidden lg:block">
      <h3>文章大纲</h3>
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
    </aside>
  );
};

export default TableOfContents;
