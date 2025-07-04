// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import PageContainer from '@/components/templates/PageContainer';
import ThemeScript from '@/components/atoms/ThemeScript';
import { getAllPostsForSearch } from '@/lib/posts';
import { cookies, headers } from 'next/headers';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: '我的 Next.js 博客',
  description: '分享我的思考、技术和生活。',
};

type Theme = 'light' | 'dark';
type UserOS = 'mac' | 'other';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const allPostsForSearch = await getAllPostsForSearch();
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  const initialTheme: Theme = themeCookie?.value === 'dark' ? 'dark' : 'light';
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const userOS: UserOS = /macintosh|mac os x/i.test(userAgent) ? 'mac' : 'other';

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeScript />
        <PageContainer
          allPostsForSearch={allPostsForSearch}
          initialTheme={initialTheme}
          userOS={userOS}
        >
          {children}
        </PageContainer>
        <SpeedInsights />
      </body>
    </html>
  );
}
