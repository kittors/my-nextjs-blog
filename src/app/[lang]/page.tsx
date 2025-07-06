// src/app/[lang]/page.tsx
import React from 'react';
import { getSortedPostsMetadata } from '@/lib/posts';
import BlogList from '@/components/organisms/BlogList';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';
import { appConfig } from '@/lib/config';
import TypingEffect from '@/components/atoms/TypingEffect';
import GlobalActionMenu from '@/components/molecules/GlobalActionMenu';
import { type Locale } from '@/i18n-config';
import { getDictionary } from '@/lib/dictionary'; // 导入 getDictionary 函数

// 核心修正：定义组件的 Props 接口，以接收来自动态路由的 lang 参数
interface HomePageProps {
  params: {
    lang: Locale;
  };
}

/**
 * Home Page 组件：博客的首页。
 * 现在它是一个服务器组件，能感知当前的语言环境。
 */
export default async function HomePage({ params }: HomePageProps) {
  const { lang } = params;
  // 核心修正：将 lang 参数传递给数据获取函数
  const allPosts = getSortedPostsMetadata(lang);

  // 核心修正：根据当前语言获取对应的标题和副标题
  const title =
    appConfig.homePage.title[lang] || appConfig.homePage.title[appConfig.language.defaultLanguage];
  const subtitles =
    appConfig.homePage.subtitles[lang] ||
    appConfig.homePage.subtitles[appConfig.language.defaultLanguage];

  // 核心新增：获取当前语言的字典
  const dictionary = await getDictionary(lang);

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

      {/* 核心新增：将 blog_list 相关的字典文本传递给 BlogList 组件 */}
      <BlogList posts={allPosts} dictionary={dictionary.blog_list} />
      <GlobalActionMenu />
    </main>
  );
}
