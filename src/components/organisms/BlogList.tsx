// src/components/organisms/BlogList.tsx
'use client';
import React from 'react';
import { BlogPostMetadata } from '@/lib/posts';
import BlogPostCard from '@/components/molecules/BlogPostCard';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import BlogPostCardSkeleton from '@/components/molecules/BlogPostCardSkeleton';
import LazyLoad from '@/components/atoms/LazyLoad'; // 核心修正：导入新的通用懒加载组件

// 定义 BlogList 组件的 Props 类型
interface BlogListProps {
  posts: BlogPostMetadata[]; // 接收博客文章元数据列表
}

/**
 * BlogList 组件：用于展示所有博客文章的列表。
 *
 * 遵循原子设计原则，它是一个组织组件，负责编排和布局其子组件。
 * 核心修正：
 * 1. 移除了内部的 `LazyBlogPostCard` 组件，将懒加载逻辑委托给可重用的 `LazyLoad` 原子组件。
 * 2. 这种重构使得 `BlogList` 组件的职责更加单一和清晰：只负责文章列表的渲染和排序。
 * 3. 每个 `BlogPostCard` 现在被 `LazyLoad` 组件包裹，并传入一个 `BlogPostCardSkeleton` 作为占位符。
 *
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

  // 按日期对文章进行排序
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
          // 使用通用的 LazyLoad 组件来实现卡片的懒加载
          <LazyLoad key={post.slug} placeholder={<BlogPostCardSkeleton />}>
            <BlogPostCard post={post} />
          </LazyLoad>
        ))}
      </div>
    </section>
  );
};

export default BlogList;
