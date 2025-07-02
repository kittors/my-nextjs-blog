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
        <Text className="text-lg text-gray-700">
          抱歉，您请求的文章不存在。
        </Text>
        <Link href="/" className="text-blue-600 hover:underline mt-6 inline-block">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <article className="container mx-auto px-4 py-12 max-w-3xl">
      {/* 返回首页链接 */}
      <Link href="/" className="text-blue-600 hover:underline mb-8 inline-block">
        &larr; 返回所有文章
      </Link>

      {/* 文章标题 */}
      <Heading level={1} className="text-4xl font-extrabold text-gray-900 mb-4">
        {post.title}
      </Heading>

      {/* 文章元数据 */}
      <div className="text-gray-600 text-sm mb-8 border-b pb-4">
        <Text as="span" className="mr-4">
          作者: {post.author}
        </Text>
        <Text as="span">
          日期: {new Date(post.date).toLocaleDateString('zh-CN')}
        </Text>
      </div>

      {/* 文章内容 */}
      {/* `dangerouslySetInnerHTML` 用于渲染 HTML 字符串，请确保内容是安全的 */}
      <div
        className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}