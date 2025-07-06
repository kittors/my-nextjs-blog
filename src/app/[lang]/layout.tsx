// src/app/[lang]/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import '../globals.css'; // 保留以确保样式被正确应用
import PageContainer from '@/components/templates/PageContainer';
import { getAllPostsForSearch } from '@/lib/posts';
import { cookies, headers } from 'next/headers';
import { getDictionary } from '@/lib/dictionary';
import { type Locale } from '@/i18n-config';
import { appConfig } from '@/lib/config';

// 你仍然可以从这里导出 Metadata，它会自动应用于此布局下的所有页面
export const metadata: Metadata = {
  title: '我的 Next.js 博客',
  description: '分享我的思考、技术和生活。',
};

type Theme = 'light' | 'dark';
type UserOS = 'mac' | 'other';

interface LangLayoutProps {
  children: React.ReactNode;
  params: { lang: Locale };
}

/**
 * 国际化页面的主布局。
 *
 * 架构性修复：
 * 此布局文件已被简化，不再渲染 <html> 和 <body> 标签。
 * 它的核心职责是：
 * 1.  根据路由参数 `lang` 获取对应语言的数据（文章、字典）。
 * 2.  从服务器请求中解析出用户偏好（主题、操作系统）。
 * 3.  将所有这些数据和上下文传递给 `PageContainer` 组件，由其构建页面的
 * Header, Footer, 和主要的 Provider。
 *
 * 这种结构彻底解决了因 `<html>` 标签嵌套导致的 Hydration 错误。
 */
export default async function LangLayout({ children, params }: LangLayoutProps) {
  const { lang } = params;
  const allPostsForSearch = await getAllPostsForSearch(lang);
  const dictionary = await getDictionary(lang);

  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  let initialTheme: Theme;

  // 核心修正：服务器端 initialTheme 的获取逻辑
  // 优先级：Cookie -> appConfig.theme.initialTheme -> 默认 'light'
  if (themeCookie?.value === 'dark') {
    initialTheme = 'dark';
  } else if (themeCookie?.value === 'light') {
    initialTheme = 'light';
  } else {
    // 如果没有有效的 cookie，则根据应用配置提供一个默认值
    // 如果 appConfig.theme.initialTheme 是 'system'，这里默认给 'light'。
    // 实际的系统偏好判断会在客户端的 ThemeScript 和 ThemeProvider 中进行。
    initialTheme = appConfig.theme.initialTheme === 'dark' ? 'dark' : 'light';
  }

  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const userOS: UserOS = /macintosh|mac os x/i.test(userAgent) ? 'mac' : 'other';

  // 直接返回 PageContainer，它会被渲染到根布局的 <body> 中
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
