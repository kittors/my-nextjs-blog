// src/components/templates/TagsPageClient.tsx
'use client';

import React, { useState, useMemo } from 'react';
import type { TagInfo, BlogPostMetadata } from '@/lib/posts';
import BlogPostList from '@/components/organisms/BlogPostList';
import TagCloud from '@/components/molecules/TagCloud';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import { type Locale } from '@/i18n-config'; // 核心新增：导入 Locale 类型

// 核心修正：更新 Props 接口以接收字典和 lang
interface TagsPageClientProps {
  allPosts: BlogPostMetadata[];
  allTags: TagInfo[];
  dictionary: {
    title: string;
    description: string;
    search_placeholder: string;
    show_all: string;
    all_tags_label: string;
    collapse_tags: string;
  };
  blogPostListDictionary: {
    // 核心新增：接收 BlogPostList 的字典
    no_posts_found: string;
  };
  lang: Locale; // 核心新增：接收当前语言
}

/**
 * TagsPageClient 组件：标签分类页面的客户端渲染部分。
 *
 * 现在它从 props 接收国际化文本，并负责渲染页面的所有 UI 元素和交互逻辑。
 *
 * @param {TagsPageClientProps} props - 从服务器组件传递过来的数据。
 */
const TagsPageClient: React.FC<TagsPageClientProps> = ({
  allPosts,
  allTags,
  dictionary,
  blogPostListDictionary,
  lang,
}) => {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!activeTag) {
      return allPosts;
    }
    return allPosts.filter(post => post.tags?.includes(activeTag));
  }, [allPosts, activeTag]);

  return (
    <div className="container mx-auto px-4 pt-8 pb-12">
      {/* 核心修正：使用字典来渲染标题和描述 */}
      <section className="text-center mb-12">
        <Heading level={1} className="text-4xl font-bold mb-3">
          {dictionary.title}
        </Heading>
        <Text className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          {dictionary.description}
        </Text>
      </section>

      <TagCloud
        tags={allTags}
        activeTag={activeTag}
        onTagClick={setActiveTag}
        dictionary={dictionary} // 将字典传递给子组件
      />

      <hr className="my-12 border-neutral-200 dark:border-neutral-800" />

      {/* 核心新增：将 blogPostListDictionary 和 lang 传递给 BlogPostList */}
      <BlogPostList posts={filteredPosts} dictionary={blogPostListDictionary} lang={lang} />
    </div>
  );
};

export default TagsPageClient;
