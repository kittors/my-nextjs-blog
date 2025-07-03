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

  // 修正：将 Hooks 调用移至组件的顶层
  // 这是 React 的核心规则，Hooks 必须在函数组件的顶层无条件地调用。
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1. NProgress 进度条逻辑
  // 现在 useEffect 依赖于从顶层 Hooks 获取的 pathname 和 searchParams。
  // 这确保了每当路由发生变化时，进度条逻辑都会被正确地重新触发。
  React.useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 300);
    
    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]); // 将 pathname 和 searchParams 添加到依赖数组

  // 2. 布局逻辑：动态将 Header 的 height 类转换为 padding 类
  // 这种方法直接从 config 读取类名并进行转换，确保了配置和实现的一致性。
  // 例如，'h-16' 会被自动转换为 'pt-16'。
  let paddingTopClass = '';
  if (headerConfig.isFixed && headerConfig.height) {
    // 使用字符串替换，这是一个健壮且通用的方法
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
            blurStrength={headerConfig.blurStrength}
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
