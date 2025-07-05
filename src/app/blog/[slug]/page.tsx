// @ts-nocheck
// src/app/blog/[slug]/page.tsx
import React from 'react';
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import Link from 'next/link';
import BlogPostContent from '@/components/templates/BlogPostContent';
import { headers } from 'next/headers';

// 核心新增：启用增量静态再生 (ISR)
// 这个值（单位：秒）定义了页面的重新验证周期。
// 在这里，我们设置为 3600 秒（1 小时）。
// 这意味着：
// 1. 页面在构建时会被静态生成。
// 2. 当用户在一小时后访问时，他们会先看到旧的静态页面。
// 3. 同时，Next.js 会在后台用最新的 Markdown 内容重新生成页面。
// 4. 后续的用户将看到更新后的内容。
export const revalidate = 3600;

interface TempPageProps {
  params: any;
  searchParams?: any;
}

/**
 * generateStaticParams 函数：
 * 用于在构建时生成所有可能的博客文章 slug，以便 Next.js 进行静态渲染 (SSG)。
 * 这确保了每个博客文章页面在部署时都是预先生成的 HTML 文件，提高了性能和SEO。
 * @returns {Array<{ slug: string }>} 包含所有文章 slug 的数组。
 */
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs;
}

/**
 * BlogPostPage 组件：
 * 这是 Next.js App Router 中的一个服务器组件，用于渲染单篇博客文章的页面。
 * 它接收路由参数 `params` (包含文章的 `slug`)，并根据 slug 获取文章内容。
 *
 * @param {TempPageProps} props - 包含路由参数和搜索参数的对象。
 * @returns {Promise<JSX.Element>} 渲染后的博客文章页面。
 */
export default async function BlogPostPage({ params }: TempPageProps) {
  const { slug } = params;
  const { content, headings, ...postMeta } = await getPostBySlug(slug);
  const post = { ...postMeta, content, slug };

  const headersList = headers();
  const referer = headersList.get('referer');
  let dynamicFallbackHref = '/';

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.pathname === '/tags') {
        dynamicFallbackHref = '/tags';
      }
    } catch (e) {
      console.error('无效的 Referer URL:', referer, e);
    }
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Heading level={1} className="text-4xl text-red-600 mb-4">
          文章未找到
        </Heading>
        <Text className="text-lg text-neutral-700">抱歉，您请求的文章不存在。</Text>
        <Link href="/" className="text-primary hover:underline mt-6 inline-block">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <BlogPostContent post={post} headings={headings} dynamicFallbackHref={dynamicFallbackHref} />
  );
}
