// src/app/[lang]/tags/page.tsx
import React from 'react';
import { getSortedPostsMetadata, getAllTags } from '@/lib/posts';
import TagsPageClient from '@/components/templates/TagsPageClient';
import { getDictionary } from '@/lib/dictionary';
import { type Locale } from '@/lib/config';

interface TagsPageProps {
  params: { lang: Locale };
}

export default async function TagsPage({ params }: TagsPageProps) {
  // 核心修正：根据 Next.js 15 的规范，在使用 params 的属性之前，必须先 `await` 它。
  // 这解决了 "params should be awaited before using its properties" 的运行时错误，
  // 从而确保了页面的稳定渲染，并从根本上解决了 404 页面的语言状态问题。
  const { lang } = await params;

  // 现在可以安全地使用已解析的 `lang` 变量
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
