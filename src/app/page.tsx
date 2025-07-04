// src/app/page.tsx
import React from 'react';
import { getSortedPostsMetadata } from '@/lib/posts';
import BlogList from '@/components/organisms/BlogList';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import { appConfig } from '@/lib/config'; // 核心新增：导入全局配置
import TypingEffect from '@/components/atoms/TypingEffect'; // 核心新增：导入打字机效果组件
import GlobalActionMenu from '@/components/molecules/GlobalActionMenu'; // 核心新增：导入 GlobalActionMenu

/**
 * Home Page 组件：博客的首页。
 *
 * 核心修正：
 * 1. 主标题和副标题现在从 `appConfig` 中动态获取，实现了内容的可配置化。
 * 2. 使用了新的 `TypingEffect` 组件来渲染副标题，为其添加了生动的打字机动画。
 * 3. 新增 `GlobalActionMenu` 组件，为首页提供“回到顶部”等全局操作按钮。
 */
export default async function HomePage() {
  const allPosts = getSortedPostsMetadata();
  const { title, subtitles } = appConfig.homePage; // 从配置中解构出首页标题内容

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center mb-12 py-10">
        <Heading level={1} className="text-5xl text-neutral-900 mb-4 tracking-tight">
          {title} {/* 使用配置中的主标题 */}
        </Heading>
        <Text className="text-lg text-neutral-700 max-w-xl mx-auto h-8">
          {/* 使用打字机效果组件渲染副标题 */}
          <TypingEffect subtitles={subtitles} />
        </Text>
      </section>

      <BlogList posts={allPosts} />

      {/* 核心新增：在首页添加 GlobalActionMenu 组件 */}
      {/* 在首页不需要大纲功能，所以不传递 onToggleToc prop */}
      <GlobalActionMenu />
    </main>
  );
}
