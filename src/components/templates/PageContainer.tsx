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

interface PageContainerProps {
  children: React.ReactNode;
  allPostsForSearch: SearchablePostData[];
  initialTheme: 'light' | 'dark';
  // 新增 prop，用于接收从服务器传来的操作系统信息
  userOS: 'mac' | 'other';
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  allPostsForSearch,
  initialTheme,
  userOS, // 接收操作系统信息
}) => {
  const { header: headerConfig, footer: footerConfig, search: searchConfig } = appConfig;
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  let paddingTopClass = '';
  if (headerConfig.isFixed && headerConfig.height) {
    paddingTopClass = headerConfig.height.replace('h-', 'pt-');
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
              // 将操作系统信息传递给 Header 组件
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
