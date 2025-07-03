// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PageContainer from '@/components/templates/PageContainer';
import ThemeScript from '@/components/atoms/ThemeScript'; // 导入新的 ThemeScript 组件

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '我的 Next.js 博客',
  description: '分享我的思考、技术和生活。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 添加 suppressHydrationWarning 来告诉 React，我们有意让服务器和客户端的
    // <html> 标签初始 class 不同，以避免水合警告。
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        {/* 在 body 的最顶端插入脚本，确保它在任何内容渲染前执行 */}
        <ThemeScript />
        <PageContainer>{children}</PageContainer>
      </body>
    </html>
  );
}
