// src/app/[lang]/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import '../globals.css';
import PageContainer from '@/components/templates/PageContainer';
import { getAllPostsForSearch } from '@/lib/posts';
import { cookies, headers } from 'next/headers';
import { getDictionary } from '@/lib/dictionary';
import { type Locale, appConfig } from '@/lib/config';

export const metadata: Metadata = {
  title: '我的 Next.js 博客',
  description: '分享我的思考、技术和生活。',
};

type Theme = 'light' | 'dark';
type UserOS = 'mac' | 'other';

// 核心修正：将 params 的类型修正为 Promise 对象。
interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}

export default async function LangLayout({ children, params }: LangLayoutProps) {
  // 由于类型已修正，现在可以安全地 await params
  const { lang } = await params;

  const allPostsForSearch = await getAllPostsForSearch(lang);
  const dictionary = await getDictionary(lang);

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  let initialTheme: Theme;

  if (themeCookie?.value === 'dark') {
    initialTheme = 'dark';
  } else if (themeCookie?.value === 'light') {
    initialTheme = 'light';
  } else {
    initialTheme = appConfig.theme.initialTheme === 'dark' ? 'dark' : 'light';
  }

  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const userOS: UserOS = /macintosh|mac os x/i.test(userAgent) ? 'mac' : 'other';

  return (
    <PageContainer
      allPostsForSearch={allPostsForSearch}
      initialTheme={initialTheme}
      userOS={userOS}
      lang={lang}
      dictionary={dictionary}
    >
      {children}
    </PageContainer>
  );
}
