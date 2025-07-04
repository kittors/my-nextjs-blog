// src/components/templates/TagsPageClient.tsx
'use client';

import React, { useState, useMemo } from 'react';
import type { TagInfo, BlogPostMetadata } from '@/lib/posts';
import BlogPostList from '@/components/organisms/BlogPostList';
import TagCloud from '@/components/molecules/TagCloud';
// 核心修正：Heading 组件已不再需要，故移除导入
// import Heading from '@/components/atoms/Heading';

interface TagsPageClientProps {
  allPosts: BlogPostMetadata[];
  allTags: TagInfo[];
}

/**
 * TagsPageClient 组件：标签分类页面的客户端渲染部分。
 *
 * 核心修正：
 * 根据您的要求，移除了页面顶部的标题和描述文本（“博文分类”等），
 * 使界面更加简洁、纯粹，让用户能直接聚焦于标签筛选和文章内容。
 *
 * @param {TagsPageClientProps} props - 从服务器组件传递过来的数据。
 */
const TagsPageClient: React.FC<TagsPageClientProps> = ({ allPosts, allTags }) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!activeTag) {
      return allPosts;
    }
    return allPosts.filter(post => post.tags?.includes(activeTag));
  }, [allPosts, activeTag]);

  return (
    // 核心修正：调整了容器的 py-12 为 pt-8 pb-12，优化移除标题后的顶部间距
    <div className="container mx-auto px-4 pt-8 pb-12">
      {/* 移除了原有的标题和描述 <section> */}
      <TagCloud tags={allTags} activeTag={activeTag} onTagClick={setActiveTag} />

      <hr className="my-12 border-neutral-200 dark:border-neutral-800" />

      <BlogPostList posts={filteredPosts} />
    </div>
  );
};

export default TagsPageClient;
