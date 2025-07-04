// src/components/atoms/LazyLoad.tsx
'use client';

import React, { useState, useEffect, useRef, ReactNode } from 'react';

// 定义 LazyLoad 组件的 Props 类型
interface LazyLoadProps {
  /**
   * 真正需要懒加载的子组件。
   */
  children: ReactNode;
  /**
   * 在子组件加载前显示的占位符组件。
   */
  placeholder: ReactNode;
  /**
   * Intersection Observer 的 rootMargin 选项。
   * 定义了视口（viewport）的边界框，用于计算交叉。
   * '200px' 意味着在元素进入视口前 200px 就开始加载。
   */
  rootMargin?: string;
}

/**
 * LazyLoad 原子组件：一个通用的懒加载容器。
 *
 * 遵循原子设计原则，这是一个独立的、可重用的功能单元。
 * 它使用 Intersection Observer API 来监听自身是否进入视口。
 * 只有当组件可见时，它才会渲染其 `children`，在此之前则显示 `placeholder`。
 * 这种方法将懒加载逻辑与具体业务组件完全解耦，提高了可重用性。
 *
 * @param {LazyLoadProps} props - 组件属性。
 */
const LazyLoad: React.FC<LazyLoadProps> = ({ children, placeholder, rootMargin = '200px' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

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

    const currentRef = ref.current;
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
  }, [isVisible, rootMargin]);

  // 根据 isVisible 状态，条件渲染占位符或真实内容
  return <div ref={ref}>{isVisible ? children : placeholder}</div>;
};

export default LazyLoad;
