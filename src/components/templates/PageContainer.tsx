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
  userOS: 'mac' | 'other';
}

// 核心修正：创建一个映射表，将 header 高度类名显式地映射到对应的 padding 类名。
// 这能确保 Tailwind 的 JIT 编译器在构建时可以静态地检测到这些类名并生成相应的 CSS。
const heightToPaddingMap: { [key: string]: string } = {
  'h-16': 'pt-16', // 64px
  'h-20': 'pt-20', // 80px
  'h-24': 'pt-24', // 96px
};

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  allPostsForSearch,
  initialTheme,
  userOS,
}) => {
  const { header: headerConfig, footer: footerConfig, search: searchConfig } = appConfig;
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  let paddingTopClass = '';
  if (headerConfig.isFixed && headerConfig.height) {
    // 使用映射表来获取正确的 padding 类名，而不是动态拼接字符串。
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
