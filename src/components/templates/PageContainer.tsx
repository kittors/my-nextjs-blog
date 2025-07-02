"use client";

import React, { useRef, useEffect, useState } from 'react';
import Header from '@/components/organisms/Header';
import { appConfig } from '@/lib/config';
import { ThemeProvider } from '@/contexts/ThemeContext'; // 导入 ThemeProvider

interface PageContainerProps {
  children: React.ReactNode;
}

/**
 * PageContainer 组件：包裹应用程序的实际内容和客户端逻辑。
 * @param {PageContainerProps} props - 组件属性。
 */
const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  const { header: headerConfig } = appConfig;
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
    // 使用 ThemeProvider 包裹所有内容，以便子组件能够访问主题上下文
    <ThemeProvider>
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

      <div style={{ paddingTop: headerHeight > 0 ? `${headerHeight}px` : '0px' }}>
        {children}
      </div>

      <footer className="bg-neutral-800 text-neutral-100 p-6 text-center mt-12">
        <p>&copy; {new Date().getFullYear()} 我的 Next.js 博客. 保留所有权利。</p>
      </footer>
    </ThemeProvider>
  );
};

export default PageContainer;