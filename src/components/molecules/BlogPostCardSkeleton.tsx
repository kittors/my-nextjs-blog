// src/components/molecules/BlogPostCardSkeleton.tsx
import React from 'react';

/**
 * BlogPostCardSkeleton 组件：一个用于表示博客文章卡片加载状态的骨架屏。
 * 遵循原子设计原则，它是一个分子组件，用于在数据加载期间提供视觉占位。
 * 其结构与 BlogPostCard 组件相匹配，以确保平滑的视觉过渡。
 */
const BlogPostCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card skeleton-pulse" aria-label="文章加载中">
      {/* 标题占位符 */}
      <div className="skeleton-line" style={{ width: '60%', height: '1.75rem' }}></div>

      {/* 描述占位符 */}
      <div className="skeleton-line" style={{ width: '90%' }}></div>
      <div className="skeleton-line" style={{ width: '75%' }}></div>

      {/* 占位符，用于填充垂直空间，确保高度一致 */}
      <div className="flex-grow"></div>

      {/* 底部元信息占位符 */}
      <div className="flex justify-between">
        <div className="skeleton-line" style={{ width: '30%' }}></div>
        <div className="skeleton-line" style={{ width: '25%' }}></div>
      </div>
    </div>
  );
};

export default BlogPostCardSkeleton;
