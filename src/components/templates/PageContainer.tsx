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
import NProgress from 'nprogress'; // 核心新增：导入 NProgress
import { usePathname } from 'next/navigation'; // 核心新增：导入 usePathname

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
  const pathname = usePathname(); // 核心新增：获取当前路径

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

  // 核心新增：添加全局事件监听器来处理路由跳转时的进度条
  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // 向上查找最近的 <a> 标签
      const anchor = target.closest('a');

      if (anchor) {
        const targetUrl = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        // 检查是否是内部导航，且路径名不同（忽略仅 hash 的变化）
        if (targetUrl.origin === currentUrl.origin && targetUrl.pathname !== currentUrl.pathname) {
          NProgress.start();
        }
      }
    };

    // 监听所有点击事件
    document.addEventListener('click', handleAnchorClick);

    // 组件卸载时移除监听器
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []); // 空依赖数组，确保只在挂载时执行一次

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
