import React from 'react';
import { getSortedPostsMetadata } from '@/lib/posts'; // 导入数据获取函数
import BlogList from '@/components/organisms/BlogList'; // 导入组织组件
import Heading from '@/components/atoms/Heading'; // 导入原子组件
import Text from '@/components/atoms/Text'; // 导入原子组件

/**
 * Home Page 组件：博客的首页。
 * 在 Next.js App Router 中，这是一个服务器组件 (默认)，可以直接进行数据获取。
 * 它负责获取所有博客文章的元数据，并将其传递给 BlogList 组织组件进行渲染。
 */
export default async function HomePage() {
  // 在服务器端获取博客文章元数据。
  // Next.js 会在构建时执行此函数 (对于 SSG) 或在请求时执行 (对于 SSR)。
  const allPosts = getSortedPostsMetadata();

  return (
    <main className="container mx-auto px-4 py-8">
      {/* 网站主标题 */}
      <section className="text-center mb-12 py-10">
        <Heading level={1} className="text-5xl text-neutral-900 mb-4 tracking-tight"> {/* 修正：使用 text-neutral-900 */}
          我的个人博客
        </Heading>
        <Text className="text-lg text-neutral-700 max-w-xl mx-auto"> {/* 修正：使用 text-neutral-700 */}
          分享我的思考、技术和生活。
        </Text>
      </section>

      {/* 博客文章列表 */}
      <BlogList posts={allPosts} />
    </main>
  );
}