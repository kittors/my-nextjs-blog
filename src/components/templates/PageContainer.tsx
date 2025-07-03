// src/components/templates/PageContainer.tsx
'use client';

import React from 'react';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';
import ProgressBar from '@/components/molecules/ProgressBar'; // 核心优化 1: 导入专用的进度条组件
import { appConfig } from '@/lib/config';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * PageContainer 组件：作为整个应用的布局容器和客户端逻辑的根。
 * 它通过 CSS 类名而非客户端 JS 计算来处理固定 Header 的布局，从而避免页面抖动。
 * 同时，它也整合了所有全局的上下文提供者 (Context Providers)。
 * @param {PageContainerProps} props - 组件属性。
 */
const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const { header: headerConfig, footer: footerConfig } = appConfig;

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

  return (
    <ThemeProvider>
      <ToastProvider>
        {/* 在此处渲染 ProgressBar 组件。
            它是一个客户端组件，负责监听路由变化并显示加载动画。
            它本身不渲染任何可见的 DOM 元素，因此可以放置在任何方便的位置。
         */}
        <ProgressBar />
        <div className="flex flex-col min-h-screen bg-background">
          <Header
            isVisible={headerConfig.isVisible}
            isFixed={headerConfig.isFixed}
            height={headerConfig.height}
            logo={headerConfig.logo}
            // 核心修正：修复了此处的拼写错误。
            logoPosition={headerConfig.logoPosition}
            isBlur={headerConfig.isBlur}
          />

          {/* 将动态计算出的 padding-top 类应用到 main 元素。
              这样，当 Header 固定在顶部时，主内容区会获得正确的上边距，防止被遮挡。
           */}
          <main className={`flex-grow ${paddingTopClass}`}>{children}</main>

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
