// src/app/layout.tsx
import './globals.css';
import React from 'react';
import type { Metadata } from 'next';
import ThemeScript from '@/components/atoms/ThemeScript';

/**
 * 唯一的根布局 (Root Layout)。
 *
 * 架构性修复：
 * 这是整个应用的唯一根布局，它定义了基础的 <html> 和 <body> 结构。
 * 1.  `suppressHydrationWarning`: 这是解决主题切换导致的水合作用错误的关键。
 * 它会告诉 React 忽略服务器和客户端在 `<html>` 标签上 `className` 属性的差异，
 * 因为我们知道这个差异是预期内的，并且会由 ThemeScript 来处理。
 * 2.  `<ThemeScript />`: 这个组件被放置在 <head> 中，确保在浏览器渲染任何
 * 可见内容之前，它能同步执行，从而避免主题闪烁 (FOUC)。
 */
export const metadata: Metadata = {
  title: '我的 Next.js 博客',
  description: '分享我的思考、技术和生活。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 注意：这里没有 `lang` 属性。在当前的 i18n 路由模式下，根布局无法动态获取 lang。
    // 这是可接受的妥协，因为修复非法的 HTML 嵌套和水合作用错误是首要任务。
    <html suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>{children}</body>
    </html>
  );
}
