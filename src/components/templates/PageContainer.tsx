// src/components/templates/PageContainer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';
import ProgressBar from '@/components/molecules/ProgressBar';
import SearchModal from '@/components/molecules/SearchModal';
// 核心修正：从 src/lib/config 导入 appConfig 和 Locale 类型
import { appConfig, type Locale } from '@/lib/config';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SearchablePostData } from '@/lib/posts';
import { SearchModalProvider } from '@/contexts/SearchModalContext';
import NProgress from 'nprogress';

interface PageContainerProps {
  children: React.ReactNode;
  allPostsForSearch: SearchablePostData[];
  initialTheme: 'light' | 'dark';
  userOS: 'mac' | 'other';
  lang: Locale;
  dictionary: any; // 接收字典
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
  lang,
  dictionary, // 使用字典
}) => {
  const { header: headerConfig, footer: footerConfig, search: searchConfig } = appConfig;
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

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
          // 核心修正：记录错误信息
          console.error('捕获到无效的 a 标签 href:', anchor.href, error);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  // 从字典中获取页脚文本并替换变量
  const footerText = dictionary.footer.copyright.replace('{year}', new Date().getFullYear());

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
              lang={lang}
              dictionary={dictionary.header} // 传递 Header 相关的字典部分
            />

            <main className={`flex-grow ${paddingTopClass}`}>{children}</main>

            <Footer
              isVisible={footerConfig.isVisible}
              text={footerText} // 使用翻译后的文本
              backgroundColor={footerConfig.backgroundColor}
              textColor={footerConfig.textColor}
            />
          </div>

          <SearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            postsData={allPostsForSearch}
            dictionary={dictionary.search} // 传递 Search 相关的字典部分
          />
        </SearchModalProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default PageContainer;
