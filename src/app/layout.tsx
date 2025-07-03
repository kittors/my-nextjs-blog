// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PageContainer from '@/components/templates/PageContainer';
import ThemeScript from '@/components/atoms/ThemeScript';
import { getAllPostsForSearch } from '@/lib/posts';
import { SearchModalProvider } from '@/contexts/SearchModalContext'; // 导入 SearchModalProvider
import { useState } from 'react'; // 导入 useState

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '我的 Next.js 博客',
  description: '分享我的思考、技术和生活。',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 在服务器端获取所有文章的搜索数据
  const allPostsForSearch = await getAllPostsForSearch();

  // 核心修正：RootLayout 现在是一个客户端组件，以使用 useState 来控制 SearchModal 状态
  // 这需要将 RootLayout 标记为 'use client'，或者将 PageContainer 拆分为客户端组件。
  // 考虑到 PageContainer 已经包含客户端逻辑，我们将 PageContainer 内部处理 SearchModal 状态。
  // 因此，此处不需要 useState，而是由 PageContainer 内部管理 isSearchModalOpen 状态，
  // 并通过 SearchModalProvider 暴露 setModalOpen。

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeScript />
        {/* 将 allPostsForSearch 传递给 PageContainer */}
        {/* PageContainer 内部将管理 isSearchModalOpen 状态并通过 SearchModalProvider 传递 setModalOpen */}
        <PageContainer allPostsForSearch={allPostsForSearch}>{children}</PageContainer>
      </body>
    </html>
  );
}
