// src/components/organisms/TableOfContents.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { type TocEntry } from '@/lib/posts';

interface TableOfContentsProps {
  headings: TocEntry[];
}

/**
 * TableOfContents 组件：一个组织级别的组件。
 * 它负责渲染文章大纲，并根据用户的滚动位置动态高亮当前章节。
 * @param {TableOfContentsProps} props - 组件属性。
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    observer.current = new IntersectionObserver(handleObserver, {
      rootMargin: '0px 0px -70% 0px', // 调整此值以确定高亮触发的时机
    });

    const elements = headings.map(({ id }) => document.getElementById(id)).filter(Boolean);
    elements.forEach((el) => observer.current?.observe(el!));

    return () => observer.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null; // 如果没有标题，则不渲染任何内容
  }

  return (
    <aside className="toc-container hidden lg:block">
      <h3>文章大纲</h3>
      <ul className="toc-list">
        {headings.map(({ id, text, level }) => (
          <li key={id} className={`level-${level}`}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start',
                });
                // 更新 URL hash，但不触发页面跳转
                history.pushState(null, '', `#${id}`);
              }}
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
