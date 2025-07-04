// src/components/atoms/LazyLoadWrapper.tsx
'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface LazyLoadWrapperProps {
  children: ReactNode;
  /**
   * 为占位符设置一个最小高度，以防止内容加载时发生布局抖动 (CLS)。
   * 这个高度应该与最终加载的内容高度大致相符。
   */
  placeholderHeight?: string;
  /**
   * 在元素进入视口前，提前多少像素开始加载。
   * 一个正值（如 '200px'）可以确保用户在滚动到内容前，内容就已经加载完毕，提升体验。
   */
  rootMargin?: string;
}

/**
 * LazyLoadWrapper 组件：一个通用的懒加载容器。
 * 遵循原子设计原则，它是一个独立的、可重用的功能单元。
 * 它使用 Intersection Observer API 来监听其占位符是否进入视口。
 * 只有当占位符可见时，它才会渲染其 `children`，从而实现内容的懒加载。
 *
 * @param {LazyLoadWrapperProps} props - 组件属性。
 */
const LazyLoadWrapper: React.FC<LazyLoadWrapperProps> = ({
  children,
  placeholderHeight = '200px', // 默认占位符高度
  rootMargin = '200px', // 默认提前加载距离
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const placeholderRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    // 如果已经可见，则无需再次观察
    if (isVisible) return;

    const observer = new IntersectionObserver(
      (entries, obs) => {
        // 当占位符与视口交叉时
        if (entries[0].isIntersecting) {
          setIsVisible(true); // 设置状态为可见，这将触发 children 的渲染
          obs.disconnect(); // 渲染后立即断开观察，避免不必要的性能开销
        }
      },
      {
        rootMargin, // 使用传入的 rootMargin 配置
      }
    );

    const currentRef = placeholderRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    // 组件卸载时执行清理，断开观察
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, [isVisible, rootMargin]); // 依赖项包含 isVisible 和 rootMargin

  // 如果已经可见，则直接渲染子组件
  if (isVisible) {
    return <>{children}</>;
  }

  // 否则，渲染一个占位符。
  // 使用 <span> 并设置为 display: 'block' 是为了确保它可以合法地存在于 <p> 标签内，
  // 同时又能像 <div> 一样占据垂直空间，防止布局抖动。
  return (
    <span
      ref={placeholderRef}
      style={{ minHeight: placeholderHeight, display: 'block' }}
      className="lazy-load-placeholder"
      aria-hidden="true"
    />
  );
};

export default LazyLoadWrapper;
