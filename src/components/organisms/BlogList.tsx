// src/components/organisms/BlogList.tsx
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { BlogPostMetadata } from '@/lib/posts';
import BlogPostCard from '@/components/molecules/BlogPostCard';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';

// 定义 BlogList 组件的 Props 类型
interface BlogListProps {
  posts: BlogPostMetadata[]; // 接收博客文章元数据列表
}

/**
 * LazyBlogPostCard 组件：一个实现了懒加载逻辑的内部组件。
 * 它使用 Intersection Observer API 来监听自身是否进入了视口。
 * 只有当组件可见时，它才会渲染真正的 BlogPostCard，从而实现性能优化。
 * @param { post: BlogPostMetadata } props - 包含单篇文章元数据的对象。
 */
const LazyBlogPostCard: React.FC<{ post: BlogPostMetadata }> = ({ post }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // 创建一个 Intersection Observer 实例
    const observer = new IntersectionObserver(
      (entries) => {
        // 当目标元素（我们的卡片占位符）与视口交叉时
        if (entries[0].isIntersecting) {
          setIsVisible(true); // 设置状态为可见，触发实际组件的渲染
          observer.disconnect(); // 渲染后立即断开观察，避免不必要的重复触发
        }
      },
      {
        // rootMargin: '200px' 表示在目标元素进入视口前 200px 就开始加载，
        // 这样用户滚动时几乎感觉不到加载过程，体验更平滑。
        rootMargin: '200px',
      }
    );

    // 开始观察目标元素
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    // 组件卸载时执行清理，断开观察
    return () => observer.disconnect();
  }, []); // 空依赖数组确保此 effect 仅在组件挂载时运行一次

  return (
    // 这个 div 同时作为 Intersection Observer 的目标和卡片的占位符。
    // 设置 min-height 是为了在卡片加载前占据空间，防止页面布局在加载时发生抖动（CLS）。
    <div ref={cardRef} className="min-h-[220px]">
      {/* 仅当 isVisible 为 true 时，才渲染真正的博客卡片组件 */}
      {isVisible && <BlogPostCard post={post} />}
    </div>
  );
};


/**
 * BlogList 组件：用于展示所有博客文章的列表。
 * 遵循原子设计原则，它是一个组织组件，由 BlogPostCard 分子组件组成。
 * @param {BlogListProps} props - 组件属性。
 * @param {BlogPostMetadata[]} props.posts - 博客文章元数据数组。
 */
const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  // 处理文章列表为空的情况
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <Text className="text-xl text-neutral-500">暂无博客文章。</Text>
      </div>
    );
  }

  // 排序逻辑保持不变，确保文章按最新日期展示
  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <section className="py-8">
      <Heading level={1} className="text-center mb-10 text-neutral-800 dark:text-neutral-200">
        最新博客文章
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/*
          核心优化：现在我们渲染的是 LazyBlogPostCard 组件，
          而不是直接渲染 BlogPostCard。懒加载逻辑被封装在了 LazyBlogPostCard 内部。
        */}
        {sortedPosts.map((post) => (
          <LazyBlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
};

export default BlogList;
