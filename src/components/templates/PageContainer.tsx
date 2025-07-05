// src/components/templates/PageContainer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';
import ProgressBar from '@/components/molecules/ProgressBar';
import SearchModal from '@/components/molecules/SearchModal';
import { appConfig } from '@/lib/config';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SearchablePostData } from '@/lib/posts';
import { SearchModalProvider } from '@/contexts/SearchModalContext';
import NProgress from 'nprogress';
// 核心修正：移除了未使用的 `usePathname` 导入，以解决构建错误。
// import { usePathname } from 'next/navigation';

interface PageContainerProps {
  children: React.ReactNode;
  allPostsForSearch: SearchablePostData[];
  initialTheme: 'light' | 'dark';
  userOS: 'mac' | 'other';
}

const heightToPaddingMap: { [key: string]: string } = {
  'h-16': 'pt-16',
  'h-20': 'pt-20',
  'h-24': 'pt-24',
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  allPostsForSearch,
  initialTheme,
  userOS,
}) => {
  const { header: headerConfig, footer: footerConfig, search: searchConfig } = appConfig;
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  // 核心修正：移除了未使用的 `pathname` 变量，这解决了 `@typescript-eslint/no-unused-vars` ESLint 错误，使代码更整洁。
  // const pathname = usePathname();

  let paddingTopClass = '';
  if (headerConfig.isFixed && headerConfig.height) {
    paddingTopClass = heightToPaddingMap[headerConfig.height] || '';
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      if (isModifierPressed && event.key.toLowerCase() === searchConfig.hotkey.toLowerCase()) {
        event.preventDefault();
        setIsSearchModalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchConfig.hotkey]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor) {
        try {
          const targetUrl = new URL(anchor.href);
          const currentUrl = new URL(window.location.href);

          if (
            targetUrl.origin === currentUrl.origin &&
            targetUrl.pathname !== currentUrl.pathname
          ) {
            NProgress.start();
          }
        } catch (error) {
          // 如果 URL 无效（例如 'mailto:'），则忽略
          console.warn('捕获到无效的 a 标签 href:', anchor.href);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  return (
    <ThemeProvider initialTheme={initialTheme}>
      <ToastProvider>
        <SearchModalProvider setModalOpen={setIsSearchModalOpen}>
          <ProgressBar />
          <div className="flex flex-col min-h-screen bg-background">
            <Header
              isVisible={headerConfig.isVisible}
              isFixed={headerConfig.isFixed}
              height={headerConfig.height}
              logo={headerConfig.logo}
              logoPosition={headerConfig.logoPosition}
              isBlur={headerConfig.isBlur}
              userOS={userOS}
            />

            <main className={`flex-grow ${paddingTopClass}`}>{children}</main>

            <Footer
              isVisible={footerConfig.isVisible}
              text={footerConfig.text}
              backgroundColor={footerConfig.backgroundColor}
              textColor={footerConfig.textColor}
            />
          </div>

          <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            postsData={allPostsForSearch}
          />
        </SearchModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default PageContainer;
