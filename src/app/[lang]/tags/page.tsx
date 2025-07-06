// src/app/[lang]/tags/page.tsx
import React from 'react';
import { getSortedPostsMetadata, getAllTags } from '@/lib/posts';
import TagsPageClient from '@/components/templates/TagsPageClient';
import { getDictionary } from '@/lib/dictionary';
import { type Locale } from '@/i18n-config';

// 核心修正：定义 Props 接口以接收 lang 参数
interface TagsPageProps {
  params: {
    lang: Locale;
  };
}

/**
 * TagsPage (Server Component): 标签分类页面的服务器端入口。
 *
 * 现在它能感知当前语言，并获取对应语言的文章和标签数据，
 * 同时加载 UI 翻译字典，然后将所有数据传递给客户端组件。
 */
export default async function TagsPage({ params }: TagsPageProps) {
  const { lang } = params;

  // 核心修正：调用数据获取函数时传入 lang 参数
  const allPosts = getSortedPostsMetadata(lang);
  const allTags = getAllTags(lang);
  const dictionary = await getDictionary(lang);

  // 核心修正：将 lang 属性传递给 TagsPageClient
  return (
    <TagsPageClient
      allPosts={allPosts}
      allTags={allTags}
      dictionary={dictionary.tags_page}
      blogPostListDictionary={dictionary.blog_post_list}
      lang={lang} // 核心修正：在这里传递 lang
    />
  );
}
