// src/app/[lang]/blog/[slug]/page.tsx
import React from 'react';
import { getAllPostsParams, getPostBySlug } from '@/lib/posts';
import BlogPostContent from '@/components/templates/BlogPostContent';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { type Locale } from '@/i18n-config';
import { getDictionary } from '@/lib/dictionary';

// 核心新增：启用增量静态再生 (ISR)
export const revalidate = 3600; // 1 hour

interface BlogPostPageProps {
  params: {
    slug: string;
    lang: Locale;
  };
}

/**
 * generateStaticParams 函数：
 * 用于在构建时为每种语言生成所有可能的博客文章 slug，
 * 以便 Next.js 进行静态渲染 (SSG)。
 * @returns {Promise<Array<{ slug: string; lang: string }>>} 包含所有文章 slug 和 lang 的数组。
 */
export async function generateStaticParams() {
  // 核心修正：使用新的 getAllPostsParams 函数，它会返回所有语言的文章参数
  const params = getAllPostsParams();
  return params;
}

/**
 * BlogPostPage 组件：
 * 这是 Next.js App Router 中的一个服务器组件，用于渲染单篇博客文章的页面。
 * 它接收路由参数 `params` (包含文章的 `slug` 和 `lang`)，并根据这些参数获取文章内容。
 *
 * @param {BlogPostPageProps} props - 包含路由参数的对象。
 * @returns {Promise<JSX.Element>} 渲染后的博客文章页面。
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug, lang } = params;
  // 核心修正：同时传递 slug 和 lang 给 getPostBySlug
  const post = await getPostBySlug(slug, lang);

  // 核心修正：如果文章未找到，调用 notFound() 显示 404 页面。
  // 这解决了从 null 类型解构属性的错误。
  if (!post) {
    notFound();
  }

  const dictionary = await getDictionary(lang);

  // 核心修正：添加 await 以解决您报告的 Promise 问题。
  const headersList = await headers();
  const referer = headersList.get('referer');
  let dynamicFallbackHref = `/${lang}`; // 默认返回到当前语言的首页

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      // 如果是从标签页过来的，就返回到当前语言的标签页
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
      dictionary={dictionary.post} // 传递文章页面相关的字典
      lang={lang}
    />
  );
}
