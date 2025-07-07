// src/components/organisms/TableOfContents.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { type TocEntry } from '@/lib/posts';
import { X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

interface TableOfContentsProps {
  headings: TocEntry[];
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

const HEADER_OFFSET = 80;
const ANIMATION_DELAY = 30; // 逐个高亮动画之间的延迟（毫秒）

const throttle = <T extends unknown[]>(callback: (...args: T) => void, delay: number) => {
  let lastCall = 0;
  let timeoutId: NodeJS.Timeout;
  return (...args: T) => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      callback(...args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = now;
        callback(...args);
      }, delay);
    }
  };
};

/**
 * TableOfContents 组件 (最终优化版)
 *
 * 核心架构优化：引入“高亮动画队列”机制，并增加“智能初始化”逻辑。
 * 此版本旨在实现极致平滑的“逐个”高亮体验，并解决页面刷新时的定位问题。
 *
 * 工作原理：
 * 1.  **智能初始化**: 组件挂载时，会首先检查 URL hash。如果 hash 存在且有效，则直接高亮对应标题。
 * 如果 hash 不存在，则会根据当前的滚动位置计算出应高亮的标题，并立即设置，确保刷新后状态正确，无多余动画。
 * 2.  **状态追踪**: 组件不仅追踪当前高亮的 `activeId`，还通过 `lastActiveIndexRef` 记录上一次高亮的标题索引。
 * 3.  **差值计算**: 在节流的滚动事件中，计算出“上一次高亮”与“当前应该高亮”的标题之间的索引差值。
 * 4.  **动画队列**: 将所有被“跳过”的标题索引按顺序生成一个队列。
 * 5.  **逐帧动画**: 启动一个递归的 `setTimeout` 循环，以极短的间隔（`ANIMATION_DELAY`）逐个处理队列中的标题，
 * 将它们依次设置为高亮状态。这创造出一种平滑、连续、可感知的高亮“追赶”动画。
 * 6.  **交互锁定**: 在用户点击目录项或动画正在进行时，会暂时锁定滚动监听的更新，以防止冲突。
 *
 * @param {TableOfContentsProps} props - 组件属性。
 */
const TableOfContents: React.FC<TableOfContentsProps> = ({ headings, isOpen, onClose, title }) => {
  const [activeId, setActiveId] = useState<string>('');
  const isMobile = useIsMobile();
  const isClickScrolling = useRef(false);
  const animationQueueRef = useRef<string[]>([]);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActiveIndexRef = useRef<number>(-1);
  const tocListWrapperRef = useRef<HTMLDivElement | null>(null);
  const headingElementsRef = useRef<{ id: string; element: HTMLElement }[]>([]);

  // 核心修正：智能初始化逻辑
  useEffect(() => {
    headingElementsRef.current = headings
      .map(({ id }) => {
        const element = document.getElementById(id);
        return element ? { id, element } : null;
      })
      .filter((item): item is { id: string; element: HTMLElement } => item !== null);

    // 定义一个函数来计算并设置初始状态
    const initializeState = () => {
      let initialActiveIndex = -1;
      const hash = window.location.hash.substring(1);

      // 优先使用 URL hash 定位
      if (hash) {
        initialActiveIndex = headingElementsRef.current.findIndex(h => h.id === hash);
      }

      // 如果没有有效的 hash，则根据滚动位置计算
      if (initialActiveIndex === -1) {
        const scrollY = window.scrollY;
        for (let i = headingElementsRef.current.length - 1; i >= 0; i--) {
          const { element } = headingElementsRef.current[i];
          if (element.offsetTop <= scrollY + HEADER_OFFSET) {
            initialActiveIndex = i;
            break;
          }
        }
      }

      // 如果仍然没有找到，则默认为第一个标题
      if (initialActiveIndex === -1 && headingElementsRef.current.length > 0) {
        initialActiveIndex = 0;
      }

      if (initialActiveIndex !== -1) {
        const initialId = headingElementsRef.current[initialActiveIndex].id;
        setActiveId(initialId);
        lastActiveIndexRef.current = initialActiveIndex;
      }
    };

    // 延迟执行初始化，以确保页面完全渲染和滚动位置恢复
    const initTimeout = setTimeout(initializeState, 100);

    return () => clearTimeout(initTimeout);
  }, [headings]);

  const runAnimationQueue = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    const nextId = animationQueueRef.current.shift();
    if (nextId) {
      setActiveId(nextId);
      animationTimeoutRef.current = setTimeout(runAnimationQueue, ANIMATION_DELAY);
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (isClickScrolling.current || animationQueueRef.current.length > 0) return;

    const scrollY = window.scrollY;
    let newActiveIndex = -1;

    const atBottom = window.innerHeight + scrollY >= document.body.offsetHeight - 5;
    if (atBottom && headingElementsRef.current.length > 0) {
      newActiveIndex = headingElementsRef.current.length - 1;
    } else {
      for (let i = headingElementsRef.current.length - 1; i >= 0; i--) {
        const { element } = headingElementsRef.current[i];
        if (element.offsetTop <= scrollY + HEADER_OFFSET) {
          newActiveIndex = i;
          break;
        }
      }
    }

    if (newActiveIndex !== -1 && newActiveIndex !== lastActiveIndexRef.current) {
      const lastIndex = lastActiveIndexRef.current;
      const newQueue: string[] = [];
      if (newActiveIndex > lastIndex) {
        for (let i = lastIndex + 1; i <= newActiveIndex; i++) {
          newQueue.push(headingElementsRef.current[i].id);
        }
      } else {
        for (let i = lastIndex - 1; i >= newActiveIndex; i--) {
          newQueue.push(headingElementsRef.current[i].id);
        }
      }

      animationQueueRef.current = newQueue;
      lastActiveIndexRef.current = newActiveIndex;
      runAnimationQueue();
    } else if (newActiveIndex === -1 && lastActiveIndexRef.current !== -1) {
      setActiveId('');
      lastActiveIndexRef.current = -1;
    }
  }, [runAnimationQueue]);

  useEffect(() => {
    const throttledScrollHandler = throttle(handleScroll, 100);
    window.addEventListener('scroll', throttledScrollHandler);
    return () => {
      window.removeEventListener('scroll', throttledScrollHandler);
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    if (activeId && tocListWrapperRef.current) {
      const activeLink = tocListWrapperRef.current.querySelector(`a.active`) as HTMLElement | null;
      if (activeLink) {
        tocListWrapperRef.current.scrollTo({
          top: activeLink.offsetTop - tocListWrapperRef.current.clientHeight / 2,
          behavior: 'smooth',
        });
      }
    }
  }, [activeId]);

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationQueueRef.current = [];
    isClickScrolling.current = true;
    setActiveId(id);

    const targetIndex = headingElementsRef.current.findIndex(h => h.id === id);
    if (targetIndex !== -1) {
      lastActiveIndexRef.current = targetIndex;
    }

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
        aria-hidden={!isOpen && isMobile}
      >
        <div className="toc-header-sticky">
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
