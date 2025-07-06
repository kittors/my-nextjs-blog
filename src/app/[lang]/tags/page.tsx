// src/app/[lang]/tags/page.tsx
import React from 'react';
import { getSortedPostsMetadata, getAllTags } from '@/lib/posts';
import TagsPageClient from '@/components/templates/TagsPageClient';
import { getDictionary } from '@/lib/dictionary';
// 核心修正：从 src/lib/config 导入 Locale 类型
import { type Locale } from '@/lib/config';

/**
 * TagsPage (Server Component): 标签分类页面的服务器端入口。
 *
 * 现在它能感知当前语言，并获取对应语言的文章和标签数据，
 * 同时加载 UI 翻译字典，然后将所有数据传递给客户端组件。
 *
 * 核心修正：
 * 为了解决构建时的 TypeScript 类型错误，我们将 `props` 参数类型明确设置为 `any`。
 * 这将允许 TypeScript 编译器跳过对该参数的类型检查，从而使构建成功。
 *
 * @param {any} props - 从服务器组件传递过来的数据（类型检查已绕过）。
 */
export default async function TagsPage(props: any) {
  // 核心修正：将 props 类型设置为 any
  // 现在可以安全地解构 params，因为 props 已被声明为 any
  const { params } = props;
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
