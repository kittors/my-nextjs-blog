// src/app/blog/[slug]/page.tsx
// 这是一个服务器组件（默认），不包含 "use client" 指令
// 必须包含 generateStaticParams 函数
// 绝对不能直接导入和使用 React Hooks (useState, useEffect, useRef 等)

import React from 'react'; // 仅导入 React JSX 语法所需，而不是 Hooks
import { getPostBySlug, getAllPostSlugs, BlogPost } from '@/lib/posts'; // 导入数据获取函数和类型
import Heading from '@/components/atoms/Heading'; // 导入原子组件
import Text from '@/components/atoms/Text'; // 导入原子组件
import Link from 'next/link';

// 导入客户端组件
import BlogPostContent from '@/components/templates/BlogPostContent';

// 定义页面 Props 的类型，这个接口仍然有用，保持不变
interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

/**
 * `generateStaticParams` 函数：
 * Next.js 会在构建时调用此函数，以确定需要预渲染哪些动态路由。
 * @returns {Array<{ slug: string }>} 包含所有文章 slug 的数组。
 */
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs;
}

/**
 * BlogPostPage 组件：单篇博客文章的详情页。
 * 这是一个服务器组件，负责根据 URL 中的 slug 获取文章内容并渲染。
 * @param {BlogPostPageProps} props - 组件属性，包含 params 对象。
 */
// 最终修正：采用最传统的 props 传递方式，以绕过 Next.js 静态分析器中可能存在的 bug。
// 我们不再以任何形式解构 props，而是直接接收完整的 props 对象。
export default async function BlogPostPage(props: BlogPostPageProps) {
  // 直接从 props.params 中获取 slug，这是最明确无误的访问方式。
  const slug = props.params.slug;
  const post: BlogPost = await getPostBySlug(slug);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Heading level={1} className="text-4xl text-red-600 mb-4">
          文章未找到
        </Heading>
        <Text className="text-lg text-neutral-700">
          抱歉，您请求的文章不存在。
        </Text>
        <Link href="/" className="text-primary hover:underline mt-6 inline-block">
          返回首页
        </Link>
      </div>
    );
  }

  // 将获取到的 post 数据传递给客户端组件 BlogPostContent
  return (
    <BlogPostContent post={post} />
  );
}
