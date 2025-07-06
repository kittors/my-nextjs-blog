// src/components/organisms/BlogList.tsx
'use client';
import React from 'react';
import { BlogPostMetadata } from '@/lib/posts';
import BlogPostCard from '@/components/molecules/BlogPostCard';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import BlogPostCardSkeleton from '@/components/molecules/BlogPostCardSkeleton';
import LazyLoad from '@/components/atoms/LazyLoad';
// 核心修正：从 src/lib/config 导入 Locale 类型
import { type Locale } from '@/lib/config';

// 核心新增：定义 BlogList 组件的 Props 类型，包含字典对象
interface BlogListProps {
  posts: BlogPostMetadata[]; // 接收博客文章元数据列表
  dictionary: {
    // 接收字典，包含 'no_posts' 和 'latest_posts_heading'
    no_posts: string;
    latest_posts_heading: string;
  };
  blogPostCardDictionary: {
    // 核心新增：接收 BlogPostCard 的字典
    author_label: string;
    date_label: string;
    unknown_date: string;
  };
  lang: Locale; // 核心新增：接收当前语言
}

/**
 * BlogList 组件：用于展示所有博客文章的列表。
 *
 * 遵循原子设计原则，它是一个组织组件，负责编排和布局其子组件。
 * 核心修正：
 * 1. 移除了内部的 `LazyBlogPostCard` 组件，将懒加载逻辑委托给可重用的 `LazyLoad` 原子组件。
 * 2. 这种重构使得 `BlogList` 组件的职责更加单一和清晰：只负责文章列表的渲染和排序。
 * 3. 每个 `BlogPostCard` 现在被 `LazyLoad` 组件包裹，并传入一个 `BlogPostCardSkeleton` 作为占位符。
 * 4. 新增国际化支持，通过 `dictionary` prop 接收多语言文本。
 * 5. 新增 `lang` prop，并将其传递给 `BlogPostCard`。
 * 6. 新增 `blogPostCardDictionary` prop，并将其传递给 `BlogPostCard`。
 *
 * @param {BlogListProps} props - 组件属性。
 * @param {BlogPostMetadata[]} props.posts - 博客文章元数据数组。
 * @param {object} props.dictionary - 包含国际化文本的对象。
 * @param {object} props.blogPostCardDictionary - 包含 BlogPostCard 国际化文本的对象。
 * @param {Locale} props.lang - 当前语言环境。
 */
const BlogList: React.FC<BlogListProps> = ({ posts, dictionary, blogPostCardDictionary, lang }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        {/* 核心修正：使用字典中的文本 */}
        <Text className="text-xl text-neutral-500">{dictionary.no_posts}</Text>
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
        {/* 核心修正：使用字典中的文本 */}
        {dictionary.latest_posts_heading}
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sortedPosts.map(post => (
          // 使用通用的 LazyLoad 组件来实现卡片的懒加载
          <LazyLoad key={post.slug} placeholder={<BlogPostCardSkeleton />}>
            {/* 核心新增：将 lang 和 blogPostCardDictionary 传递给 BlogPostCard */}
            <BlogPostCard post={post} lang={lang} dictionary={blogPostCardDictionary} />
          </LazyLoad>
        ))}
      </div>
    </section>
  );
};

export default BlogList;
