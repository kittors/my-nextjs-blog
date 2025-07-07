// src/app/[lang]/page.tsx
import React from 'react';
import { getSortedPostsMetadata } from '@/lib/posts';
import BlogList from '@/components/organisms/BlogList';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import { appConfig, type Locale } from '@/lib/config';
import TypingEffect from '@/components/atoms/TypingEffect';
import GlobalActionMenu from '@/components/molecules/GlobalActionMenu';
import { getDictionary } from '@/lib/dictionary';

// 核心修正：将 params 的类型修正为 Promise 对象。
interface HomePageProps {
  params: Promise<{ lang: Locale }>;
}

export default async function HomePage({ params }: HomePageProps) {
  // 由于类型已修正，现在可以安全地 await params
  const { lang } = await params;

  const allPosts = getSortedPostsMetadata(lang);

  const title =
    appConfig.homePage.title[lang] || appConfig.homePage.title[appConfig.language.defaultLocale];
  const subtitles =
    appConfig.homePage.subtitles[lang] ||
    appConfig.homePage.subtitles[appConfig.language.defaultLocale];

  const dictionary = await getDictionary(lang);

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12 py-10 text-center">
        <Heading level={1} className="text-5xl tracking-tight text-neutral-900 mb-4">
          {title}
        </Heading>
        <Text className="mx-auto h-8 max-w-xl text-lg text-neutral-700">
          <TypingEffect subtitles={subtitles} />
        </Text>
      </section>

      <BlogList
        posts={allPosts}
        dictionary={dictionary.blog_list}
        blogPostCardDictionary={dictionary.blog_post_card}
        lang={lang}
      />
      <GlobalActionMenu />
    </main>
  );
}
