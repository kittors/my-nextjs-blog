// src/app/page.tsx
import React from 'react';
import { getSortedPostsMetadata } from '@/lib/posts';
import BlogList from '@/components/organisms/BlogList';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import { appConfig } from '@/lib/config';
import TypingEffect from '@/components/atoms/TypingEffect';
import GlobalActionMenu from '@/components/molecules/GlobalActionMenu';

/**
 * Home Page 组件：博客的首页。
 */
export default async function HomePage() {
  const allPosts = getSortedPostsMetadata();
  const { title, subtitles } = appConfig.homePage;

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="text-center mb-12 py-10">
        <Heading level={1} className="text-5xl text-neutral-900 mb-4 tracking-tight">
          {title}
        </Heading>
        <Text className="text-lg text-neutral-700 max-w-xl mx-auto h-8">
          <TypingEffect subtitles={subtitles} />
        </Text>
      </section>

      <BlogList posts={allPosts} />
      <GlobalActionMenu />
    </main>
  );
}
