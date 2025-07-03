// src/components/templates/PageContainer.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';
import ProgressBar from '@/components/molecules/ProgressBar';
import SearchModal from '@/components/molecules/SearchModal'; // 导入 SearchModal
import { appConfig } from '@/lib/config';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SearchablePostData } from '@/lib/posts'; // 导入 SearchablePostData 类型

interface PageContainerProps {
  children: React.ReactNode;
  allPostsForSearch: SearchablePostData[]; // 新增：接收所有文章的搜索数据
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
  // 这是解决固定 Header 遮挡页面内容的关键。
  let paddingTopClass = '';
  // 检查 Header 是否配置为固定定位 (isFixed) 并且定义了高度。
  if (headerConfig.isFixed && headerConfig.height) {
    // 根据 Header 的高度 (例如 'h-16') 自动生成对应的上内边距类 (例如 'pt-16')。
    // 这种方法遵循了配置驱动开发的原则，当你在 config.ts 中改变 Header 高度时，
    // 布局会自动适应，无需修改组件代码。
    paddingTopClass = headerConfig.height.replace('h-', 'pt-');
  }

  // 监听快捷键打开搜索模态框
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // 检查是否按下了 Cmd (Mac) 或 Ctrl (Windows/Linux) 键，并且按下了配置的快捷键
      const isModifierPressed = event.metaKey || event.ctrlKey;
      if (isModifierPressed && event.key.toLowerCase() === searchConfig.hotkey.toLowerCase()) {
        event.preventDefault(); // 阻止默认行为，例如浏览器搜索
        setIsSearchModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchConfig.hotkey]); // 依赖于快捷键配置

  return (
    <ThemeProvider>
      <ToastProvider>
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

        {/* 渲染搜索模态框，并将文章数据传递给它 */}
        <SearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
          postsData={allPostsForSearch}
        />
      </ToastProvider>
    </ThemeProvider>
  );
};

export default PageContainer;
