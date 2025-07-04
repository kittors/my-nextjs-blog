// src/components/organisms/BlogList.tsx
'use client';
import React, { useState, useEffect, useRef } from 'react';
import { BlogPostMetadata } from '@/lib/posts';
import BlogPostCard from '@/components/molecules/BlogPostCard';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import BlogPostCardSkeleton from '@/components/molecules/BlogPostCardSkeleton'; // 核心: 导入骨架屏组件

// 定义 BlogList 组件的 Props 类型
interface BlogListProps {
  posts: BlogPostMetadata[]; // 接收博客文章元数据列表
}

/**
 * LazyBlogPostCard 组件：一个实现了懒加载逻辑的内部组件。
 * 它使用 Intersection Observer API 来监听自身是否进入了视口。
 * 核心升级：在组件不可见时，它会渲染一个骨架屏占位符。
 * 当组件可见时，它才会渲染真正的 BlogPostCard，从而实现性能与体验的完美结合。
 * @param { post: BlogPostMetadata } props - 包含单篇文章元数据的对象。
 */
const LazyBlogPostCard: React.FC<{ post: BlogPostMetadata }> = ({ post }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px', // 在元素进入视口前 200px 就开始加载
      }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 核心升级：
  // - 在 ref 容器中，根据 isVisible 状态条件渲染。
  // - isVisible 为 false 时，显示骨架屏。
  // - isVisible 为 true 时，显示真实的博客卡片。
  // - 不再需要 min-height，因为骨架屏组件自身就带有高度。
  return (
    <div ref={cardRef}>{isVisible ? <BlogPostCard post={post} /> : <BlogPostCardSkeleton />}</div>
  );
};

/**
 * BlogList 组件：用于展示所有博客文章的列表。
 * 遵循原子设计原则，它是一个组织组件，由 BlogPostCard 分子组件组成。
 * @param {BlogListProps} props - 组件属性。
 * @param {BlogPostMetadata[]} props.posts - 博客文章元数据数组。
 */
const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <Text className="text-xl text-neutral-500">暂无博客文章。</Text>
      </div>
    );
  }

  const sortedPosts = [...posts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <section className="py-8">
      <Heading level={1} className="text-center mb-10 text-[var(--blog-list-heading-color)]">
        最新博客文章
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPosts.map(post => (
          <LazyBlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
};

export default BlogList;
