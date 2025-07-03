// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PageContainer from '@/components/templates/PageContainer';
import ThemeScript from '@/components/atoms/ThemeScript'; // 导入新的 ThemeScript 组件
import { getAllPostsForSearch } from '@/lib/posts'; // 导入新的数据获取函数

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
  // 这将在构建时执行，并将数据作为 props 传递给客户端组件
  const allPostsForSearch = await getAllPostsForSearch();

  return (
    // 添加 suppressHydrationWarning 来告诉 React，我们有意让服务器和客户端的
    // <html> 标签初始 class 不同，以避免水合警告。
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {/* 在 body 的最顶端插入脚本，确保它在任何内容渲染前执行 */}
        <ThemeScript />
        {/* 将 allPostsForSearch 传递给 PageContainer */}
        <PageContainer allPostsForSearch={allPostsForSearch}>{children}</PageContainer>
      </body>
    </html>
  );
}
