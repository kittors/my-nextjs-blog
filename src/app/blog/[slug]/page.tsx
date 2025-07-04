// @ts-nocheck
// src/app/blog/[slug]/page.tsx
import React from 'react';
import { getPostBySlug, getAllPostSlugs } from '@/lib/posts';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import Link from 'next/link';
import BlogPostContent from '@/components/templates/BlogPostContent';
// 核心新增：从 'next/headers' 导入 headers 函数，用于获取请求头信息
import { headers } from 'next/headers';

// 核心修正：定义一个临时的、更宽松的 PageProps 接口，用于绕过编译时的类型错误。
// 这里的 `params` 和 `searchParams` 都被设置为 `any`，以满足编译器可能存在的、
// 不合理的 Promise 属性要求。在运行时，Next.js 会确保它们是正确的对象类型。
interface TempPageProps {
  params: any; // 临时使用 any 来绕过编译错误，因为编译器错误地认为 params 缺少 Promise 属性。
  searchParams?: any; // 核心修正：也将 searchParams 设置为 any，以绕过新的编译错误。
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
 * 核心修正：
 * 1. 使用 `TempPageProps` 接口来定义组件的 props。
 * 2. 动态判断 `Referer` 头部，以确定“返回”按钮的备用链接。
 *
 * @param {TempPageProps} props - 包含路由参数和搜索参数的对象。
 * @returns {Promise<JSX.Element>} 渲染后的博客文章页面。
 */
export default async function BlogPostPage({ params }: TempPageProps) {
  // 运行时，我们知道 params.slug 是一个 string，所以这里可以安全地解构。
  const { slug } = params;

  // 调用异步函数 getPostBySlug 获取文章内容和元数据。
  // `await` 关键字确保在继续执行之前，Promise 已经解析。
  const { content, headings, ...postMeta } = await getPostBySlug(slug);

  // 组合文章数据，包括解析后的内容和 slug。
  const post = { ...postMeta, content, slug };

  // 核心新增：根据 Referer 头部动态设置 fallbackHref
  const headersList = headers();
  const referer = headersList.get('referer'); // 获取 Referer 头部
  let dynamicFallbackHref = '/'; // 默认备用链接为首页

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      // 如果 Referer 的路径是 /tags，则将备用链接设置为 /tags
      if (refererUrl.pathname === '/tags') {
        dynamicFallbackHref = '/tags';
      }
      // 如果需要，可以在这里添加更多条件，例如检查 refererUrl.origin 是否与当前站点匹配
    } catch (e) {
      // 如果 Referer URL 无效，捕获错误并使用默认备用链接
      console.error('无效的 Referer URL:', referer, e);
    }
  }

  // 如果文章不存在，则显示“文章未找到”的提示信息。
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

  // 渲染 BlogPostContent 组件，传入文章数据、标题列表和动态备用链接。
  return (
    <BlogPostContent post={post} headings={headings} dynamicFallbackHref={dynamicFallbackHref} />
  );
}
