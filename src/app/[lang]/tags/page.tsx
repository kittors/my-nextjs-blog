// src/app/[lang]/tags/page.tsx
import React from 'react';
import { getSortedPostsMetadata, getAllTags } from '@/lib/posts';
import TagsPageClient from '@/components/templates/TagsPageClient';
import { getDictionary } from '@/lib/dictionary';
import { type Locale } from '@/lib/config';

// 核心修正：将 params 的类型修正为 Promise 对象。
interface TagsPageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function TagsPage({ params }: TagsPageProps) {
  // 由于类型已修正，现在可以安全地 await params
  const { lang } = await params;

  const allPosts = getSortedPostsMetadata(lang);
  const allTags = getAllTags(lang);
  const dictionary = await getDictionary(lang);

  return (
    <TagsPageClient
      allPosts={allPosts}
      allTags={allTags}
      dictionary={dictionary.tags_page}
      blogPostListDictionary={dictionary.blog_post_list}
      lang={lang}
    />
  );
}
