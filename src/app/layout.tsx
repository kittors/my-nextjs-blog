// src/app/layout.tsx
// 这是一个服务器组件（默认），所以这里绝对不能有 "use client" 指令。
// 必须包含 <html> 和 <body> 标签，并导出 metadata。

import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

// 导入客户端组件 PageContainer，它将处理所有需要 Hooks 的逻辑
import PageContainer from '@/components/templates/PageContainer';

const inter = Inter({ subsets: ['latin'] });

// 定义元数据，用于 SEO。这里可以导出 metadata，因为它是在服务器组件中。
export const metadata: Metadata = {
  title: '我的 Next.js 博客',
  description: '一个使用 Next.js 构建的简单博客项目。',
};

/**
 * RootLayout 组件：应用程序的根布局。
 * 这是 Next.js App Router 的强制性文件，必须包含 <html> 和 <body>。
 * 负责设置 HTML 结构、引入全局样式和字体，并包裹客户端逻辑。
 * @param {object} props - 组件属性。
 * @param {React.ReactNode} props.children - 页面内容。
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      {/* <body> 标签必须在这里渲染 */}
      <body className={inter.className}>
        {/*
          将所有需要客户端交互和 Hooks 的逻辑包裹在一个客户端组件中。
          Header、Footer 和 paddingTop 逻辑现在都由 PageContainer 处理。
        */}
        <PageContainer>
          {children}
        </PageContainer>
      </body>
    </html>
  );
}