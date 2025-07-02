import React from 'react';
import { getPostBySlug, getAllPostSlugs, BlogPost } from '@/lib/posts'; // 导入数据获取函数和类型
import Heading from '@/components/atoms/Heading'; // 导入原子组件
import Text from '@/components/atoms/Text'; // 导入原子组件
import Link from 'next/link';

// 定义页面 Props 的类型，包含路由参数
interface BlogPostPageProps {
  params: {
    slug: string; // 从 URL 动态路由中获取的 slug
  };
}

/**
 * `generateStaticParams` 函数：
 * Next.js 会在构建时调用此函数，以确定需要预渲染哪些动态路由。
 * 对于博客项目，这意味着我们会为每篇博客文章生成一个静态页面。
 * @returns {Array<{ slug: string }>} 包含所有文章 slug 的数组。
 */
export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs;
}

/**
 * BlogPostPage 组件：单篇博客文章的详情页。
 * 这是一个服务器组件，负责根据 URL 中的 slug 获取文章内容并渲染。
 * @param {BlogPostPageProps} props - 组件属性。
 * @param {object} props.params - 路由参数，包含 slug。
 */
export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post: BlogPost = await getPostBySlug(params.slug);

  if (!post) {
    // 如果文章不存在，可以显示 404 页面或重定向
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Heading level={1} className="text-4xl text-red-600 mb-4">
          文章未找到
        </Heading>
        <Text className="text-lg text-neutral-700"> {/* 修正：使用 text-neutral-700 */}
          抱歉，您请求的文章不存在。
        </Text>
        <Link href="/" className="text-primary hover:underline mt-6 inline-block"> {/* 修正：使用 text-primary */}
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      {/* 返回首页链接 */}
      <Link href="/" className="text-primary hover:underline mb-8 inline-block flex items-center group"> {/* 修正：使用 text-primary，并增加 flex/group 样式 */}
        <svg className="w-5 h-5 mr-2 -translate-x-1 group-hover:-translate-x-0 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        返回所有文章
      </Link>

      {/* 文章标题 */}
      <Heading level={1} className="text-4xl font-extrabold text-neutral-900 mb-4"> {/* 修正：使用 text-neutral-900 */}
        {post.title}
      </Heading>

      {/* 文章元数据 */}
      <div className="text-neutral-500 text-sm mb-8 border-b border-neutral-200 pb-4"> {/* 修正：使用 text-neutral-500 和 border-neutral-200 */}
        <Text as="span" className="mr-4">
          作者: {post.author}
        </Text>
        <Text as="span">
          日期: {new Date(post.date).toLocaleDateString('zh-CN')}
        </Text>
      </div>

      {/* 文章内容 */}
      <div
        className="prose prose-lg max-w-none text-neutral-800 leading-relaxed" // 修正：使用 text-neutral-800
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}