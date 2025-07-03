// src/app/blog/[slug]/page.tsx
import React from 'react';
import { getPostBySlug, getAllPostSlugs, BlogPost } from '@/lib/posts';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import Link from 'next/link';
import BlogPostContent from '@/components/templates/BlogPostContent';
import { type TocEntry } from '@/lib/posts'; // 导入大纲类型

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = getAllPostSlugs();
  return slugs;
}

export default async function BlogPostPage(props: BlogPostPageProps) {
  const slug = props.params.slug;
  
  // 现在 getPostBySlug 会返回包含 headings 的对象
  const { contentHtml, headings, ...postMeta } = await getPostBySlug(slug);

  const post = { ...postMeta, contentHtml };

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

  // 将 post 和 headings 都传递给客户端组件
  return (
    <BlogPostContent post={post} headings={headings} />
  );
}
