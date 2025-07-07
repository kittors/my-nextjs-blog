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

interface BlogPostPageProps {
  params: { slug: string; lang: Locale };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  // 核心修正：根据 Next.js 15 的规范，在使用 params 的属性之前，必须先 `await` 它。
  const { slug, lang } = await params;

  // 现在可以安全地使用已解析的 `slug` 和 `lang` 变量
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
