// src/components/templates/PageContainer.tsx
"use client";

import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';
import { appConfig } from '@/lib/config';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import NProgress from 'nprogress';

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * PageContainer 组件：作为整个应用的布局容器和客户端逻辑的根。
 * 它通过 CSS 类名而非客户端 JS 计算来处理固定 Header 的布局，从而避免页面抖动。
 * @param {PageContainerProps} props - 组件属性。
 */
const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const { header: headerConfig, footer: footerConfig } = appConfig;

  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 300);
    
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  let paddingTopClass = '';
  if (headerConfig.isFixed && headerConfig.height) {
    paddingTopClass = headerConfig.height.replace('h-', 'pt-');
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="flex flex-col min-h-screen bg-background">
          <Header
            isVisible={headerConfig.isVisible}
            isFixed={headerConfig.isFixed}
            height={headerConfig.height}
            logo={headerConfig.logo}
            logoPosition={headerConfig.logoPosition}
            isBlur={headerConfig.isBlur}
            // 核心修正：移除 blurStrength prop 的传递，因为它在 Header 组件中已被弃用。
            // blurStrength={headerConfig.blurStrength} 
          />

          {/* 将动态生成的 padding 类应用到 main 元素 */}
          <main className={`flex-grow ${paddingTopClass}`}>
            {children}
          </main>

          <Footer
            isVisible={footerConfig.isVisible}
            text={footerConfig.text}
            backgroundColor={footerConfig.backgroundColor}
            textColor={footerConfig.textColor}
          />
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default PageContainer;
