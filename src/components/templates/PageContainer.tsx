"use client";

import React, { useRef, useEffect, useState } from 'react';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';
import { appConfig } from '@/lib/config';
import { ThemeProvider } from '@/contexts/ThemeContext';

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * PageContainer 组件：包裹应用程序的实际内容和客户端逻辑。
 * 它处理 Header 高度计算、确保内容不被遮挡，并实现 Sticky Footer 布局。
 * @param {PageContainerProps} props - 组件属性。
 * @param {React.ReactNode} props.children - 实际的页面内容。
 */
const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const { header: headerConfig, footer: footerConfig } = appConfig;
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useEffect(() => {
    if (headerConfig.isFixed && headerRef.current) {
      const calculatedHeight = headerRef.current.offsetHeight;
      setHeaderHeight(calculatedHeight);
    } else {
      setHeaderHeight(0);
    }

    const handleResize = () => {
      if (headerConfig.isFixed && headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [headerConfig.isFixed]);

  return (
    // ThemeProvider 包裹整个布局结构
    <ThemeProvider>
      {/* 修正：将 flex flex-col min-h-screen 应用到这个包裹 Header、内容和 Footer 的 div 上 */}
      <div className="flex flex-col min-h-screen">
        <Header
          ref={headerRef}
          isVisible={headerConfig.isVisible}
          isFixed={headerConfig.isFixed}
          height={headerConfig.height}
          logo={headerConfig.logo}
          logoPosition={headerConfig.logoPosition}
          isBlur={headerConfig.isBlur}
          blurStrength={headerConfig.blurStrength}
        />

        {/* 主内容区域，使用 flex-grow 填充剩余空间，并应用 Header 的 paddingTop */}
        <div
          className="flex-grow" /* 确保内容区域能扩展以填充剩余空间 */
          style={{ paddingTop: headerHeight > 0 ? `${headerHeight}px` : '0px' }}
        >
          {children}
        </div>

        {/* Footer 组件 */}
        <Footer
          isVisible={footerConfig.isVisible}
          text={footerConfig.text}
          backgroundColor={footerConfig.backgroundColor}
          textColor={footerConfig.textColor}
        />
      </div>
    </ThemeProvider>
  );
};

export default PageContainer;