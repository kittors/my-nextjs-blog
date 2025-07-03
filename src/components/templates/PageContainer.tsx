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
import { SearchModalProvider } from '@/contexts/SearchModalContext'; // 导入 SearchModalProvider

interface PageContainerProps {
  children: React.ReactNode;
  allPostsForSearch: SearchablePostData[];
}

/**
 * PageContainer 组件：作为整个应用的布局容器和客户端逻辑的根。
 * 它通过 CSS 类名而非客户端 JS 计算来处理固定 Header 的布局，从而避免页面抖动。
 * 同时，它也整合了所有全局的上下文提供者 (Context Providers)。
 * 新增了全局搜索模态框的控制逻辑和快捷键监听。
 *
 * @param {PageContainerProps} props - 组件属性。
 */
const PageContainer: React.FC<PageContainerProps> = ({ children, allPostsForSearch }) => {
  const { header: headerConfig, footer: footerConfig, search: searchConfig } = appConfig;
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // 动态计算 main 元素的上边距。
  let paddingTopClass = '';
  if (headerConfig.isFixed && headerConfig.height) {
    // 核心修正：现在 Header 的总高度由 height 属性直接控制，
    // 内部 padding 已经移动到 <nav> 元素，不影响 Header 容器的总高度。
    // 因此，直接使用 headerConfig.height 对应的 pt- 值即可。
    paddingTopClass = headerConfig.height.replace('h-', 'pt-'); // 例如 'h-16' -> 'pt-16'
  }

  // 监听快捷键打开/关闭搜索模态框
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
    <ThemeProvider>
      <ToastProvider>
        {/* 核心修正：使用 SearchModalProvider 包裹内容，并传递 setIsSearchModalOpen */}
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
