// src/app/[lang]/blog/[slug]/page.tsx
import React from 'react';
import { getAllPostsParams, getPostBySlug } from '@/lib/posts';
import BlogPostContent from '@/components/templates/BlogPostContent';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { type Locale } from '@/lib/config';
import { getDictionary } from '@/lib/dictionary';

export const revalidate = 3600;

export async function generateStaticParams() {
  const params = await getAllPostsParams();
  return params;
}

// 核心修正：将 params 的类型从一个普通对象修正为 Promise 对象，
// 以匹配 Next.js 15 的异步特性，从而解决构建时的类型错误。
interface BlogPostPageProps {
  params: Promise<{ slug: string; lang: Locale }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // 由于类型已修正，现在可以安全地 await params
  const { slug, lang } = await params;

  const post = await getPostBySlug(slug, lang);

  if (!post) {
    notFound();
  }

  const dictionary = await getDictionary(lang);
  const headersList = await headers();
  const referer = headersList.get('referer');
  let dynamicFallbackHref = `/${lang}`;

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.pathname === `/${lang}/tags`) {
        dynamicFallbackHref = `/${lang}/tags`;
      }
    } catch (e) {
      console.error('无效的 Referer URL:', referer, e);
    }
  }

  return (
    <BlogPostContent
      post={post}
      headings={post.headings}
      dynamicFallbackHref={dynamicFallbackHref}
      dictionary={dictionary.post}
      lang={lang}
      postContentDictionary={dictionary.post_content}
    />
  );
}
