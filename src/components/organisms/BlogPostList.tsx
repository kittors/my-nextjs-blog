// src/components/organisms/BlogPostList.tsx
'use client';

import React from 'react';
import { type BlogPostMetadata } from '@/lib/posts';
import BlogPostListCard from '@/components/molecules/BlogPostListCard';
import { AnimatePresence, motion } from 'framer-motion';
import { type Locale } from '@/i18n-config'; // 核心新增：导入 Locale 类型

// 核心新增：定义 BlogPostListProps 接口，包含字典
interface BlogPostListProps {
  posts: BlogPostMetadata[];
  dictionary: {
    // 字典包含 'no_posts_found' 键
    no_posts_found: string;
  };
  lang: Locale; // 核心新增：接收当前语言
}

/**
 * BlogPostList 组件：一个专为列表视图设计的组织组件。
 *
 * 它负责渲染一个垂直的、列表形式的文章卡片流。
 * 核心亮点是集成了 `framer-motion` 库，为文章列表的过滤和刷新
 * 提供了流畅、优雅的动画效果，极大地提升了用户体验。
 * 核心修正：
 * 1. 接受 `dictionary` prop 以支持多语言显示“未找到文章”的消息。
 * 2. 接受 `lang` prop，并将其传递给 `BlogPostListCard`。
 *
 * @param {BlogPostListProps} props - 组件属性。
 */
const BlogPostList: React.FC<BlogPostListProps> = ({ posts, dictionary, lang }) => {
  if (posts.length === 0) {
    return (
      <div className="no-posts-found">
        {/* 核心修正：使用字典中的文本 */}
        <p>{dictionary.no_posts_found}</p>
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
            {/* 核心新增：将 lang 传递给 BlogPostListCard */}
            <BlogPostListCard post={post} lang={lang} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BlogPostList;
