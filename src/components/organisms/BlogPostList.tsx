// src/components/organisms/BlogPostList.tsx
'use client';

import React from 'react';
import { type BlogPostMetadata } from '@/lib/posts';
import BlogPostListCard from '@/components/molecules/BlogPostListCard';
import { AnimatePresence, motion } from 'framer-motion';

interface BlogPostListProps {
  posts: BlogPostMetadata[];
}

/**
 * BlogPostList 组件：一个专为列表视图设计的组织组件。
 *
 * 它负责渲染一个垂直的、列表形式的文章卡片流。
 * 核心亮点是集成了 `framer-motion` 库，为文章列表的过滤和刷新
 * 提供了流畅、优雅的动画效果，极大地提升了用户体验。
 *
 * @param {BlogPostListProps} props - 组件属性。
 */
const BlogPostList: React.FC<BlogPostListProps> = ({ posts }) => {
  if (posts.length === 0) {
    return (
      <div className="no-posts-found">
        <p>在此分类下没有找到相关的文章。</p>
      </div>
    );
  }

  return (
    <div className="blog-post-list-container">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.slug}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <BlogPostListCard post={post} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BlogPostList;
