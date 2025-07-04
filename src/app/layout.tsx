// src/app/layout.tsx
import type { Metadata } from 'next';
// 核心修正：移除未使用的 'Inter' 导入
// import { Inter } from 'next/font/google';
import './globals.css';
import PageContainer from '@/components/templates/PageContainer';
import ThemeScript from '@/components/atoms/ThemeScript';
import { getAllPostsForSearch } from '@/lib/posts';
// 核心：从 'next/headers' 导入 cookies 和 headers 函数
import { cookies, headers } from 'next/headers';

// 核心修正：移除未使用的 'inter' 变量声明
// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '我的 Next.js 博客',
  description: '分享我的思考、技术和生活。',
};

type Theme = 'light' | 'dark';
// 新增：定义用户操作系统的类型
type UserOS = 'mac' | 'other';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const allPostsForSearch = await getAllPostsForSearch();

  // --- 主题处理 (保持不变) ---
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  const initialTheme: Theme = themeCookie?.value === 'dark' ? 'dark' : 'light';

  // --- 核心修正：快捷键处理 ---
  // 1. 在服务器端异步获取请求头对象
  const headersList = await headers();
  // 2. 从解析后的请求头中获取 'user-agent' 字符串
  const userAgent = headersList.get('user-agent') || '';
  // 3. 根据 user-agent 判断操作系统
  const userOS: UserOS = /macintosh|mac os x/i.test(userAgent) ? 'mac' : 'other';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeScript />
        {/* 将初始主题和操作系统信息一起传递给 PageContainer */}
        <PageContainer
          allPostsForSearch={allPostsForSearch}
          initialTheme={initialTheme}
          userOS={userOS}
        >
          {children}
        </PageContainer>
      </body>
    </html>
  );
}
