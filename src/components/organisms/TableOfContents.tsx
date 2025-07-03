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
 * 优化点：
 * 1. 当大纲列表溢出滚动时，确保当前激活的标题始终保持在可见区域内。
 * 2. `<h3>文章大纲</h3>` 固定显示在组件的顶部，且不参与列表滚动。
 *
 * @param {TableOfContentsProps} props - 组件属性。
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeId, setActiveId] = useState<string>('');
  const observer = useRef<IntersectionObserver | null>(null);
  // 标记是否是用户点击触发的滚动，以避免 IntersectionObserver 冲突
  const isClickScrolling = useRef(false);
  // 引用大纲列表的滚动容器 <div> 元素，用于滚动激活项
  const tocListWrapperRef = useRef<HTMLDivElement>(null);
  // 引用整个大纲容器 <aside> 元素，用于获取粘性标题高度
  const tocContainerRef = useRef<HTMLElement>(null); // 保留此ref用于获取容器高度或样式

  // 滚动和高亮逻辑 (IntersectionObserver)
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

  // 新增 useEffect 钩子：当 activeId 变化时，滚动大纲列表以确保激活项可见
  useEffect(() => {
    // 只有当 activeId 存在，并且 tocListWrapperRef 对应的 DOM 元素已挂载，
    // 并且当前不是用户点击触发的滚动时才执行。
    if (activeId && tocListWrapperRef.current && !isClickScrolling.current) {
      // 查找当前激活的链接元素
      const activeLink = tocListWrapperRef.current.querySelector(`a.active`);

      if (activeLink) {
        // 获取粘性标题的 DOM 元素（它在 toc-container 内部，但不在滚动容器 toc-list-wrapper 内部）
        // stickyHeaderHeight 现在用于计算滚动到视图中心所需的偏移量
        const stickyHeader = tocContainerRef.current?.querySelector(
          '.toc-header-sticky'
        ) as HTMLElement | null;
        const stickyHeaderHeight = stickyHeader ? stickyHeader.offsetHeight : 0;

        // 计算目标滚动位置：激活链接的顶部位置 (相对于 tocListWrapperRef)
        // 加上滚动容器的当前滚动位置，再减去粘性标题的高度和一些缓冲，
        // 这样激活链接会显示在粘性标题下方，并尽量居中。
        const elementTopInScrollContainer = activeLink.offsetTop;
        const scrollContainerHeight = tocListWrapperRef.current.clientHeight;

        // 目标位置：将激活项滚动到滚动容器的中间，并考虑粘性标题的高度
        // 减去 stickyHeaderHeight 是为了确保激活项不会被粘性标题遮挡
        const targetScrollTop =
          elementTopInScrollContainer -
          scrollContainerHeight / 2 +
          activeLink.clientHeight / 2 +
          stickyHeaderHeight;

        // 平滑滚动 toc-list-wrapper
        tocListWrapperRef.current.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });
      }
    }
  }, [activeId]); // 依赖 activeId，当它改变时重新运行此 effect

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
      // 精确计算滚动位置，减去 Header 的高度和偏移量
      const targetPosition = targetElement.offsetTop - HEADER_OFFSET;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
      // 更新 URL hash，但不会触发页面重新加载
      history.pushState(null, '', `#${id}`);
    }

    // 在滚动动画结束后，恢复滚动监听的逻辑。
    // 这个延时确保了平滑滚动有足够的时间完成，避免了 observer 立即覆盖点击设置的状态。
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
      {/* <h3>文章大纲</h3> 固定显示在顶部 */}
      <h3 className="toc-header-sticky">文章大纲</h3>
      {/* 新增的 div 包装器，负责列表的滚动 */}
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
