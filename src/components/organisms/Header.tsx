// src/components/organisms/Header.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeaderLogoConfig } from '@/lib/config';
import ThemeToggle from '@/components/molecules/ThemeToggle'; // 导入 ThemeToggle 组件

// 定义 Header 组件的 Props 类型
interface HeaderProps {
  isVisible?: boolean;
  isFixed?: boolean;
  height?: string;
  logo: HeaderLogoConfig;
  logoPosition: 'left' | 'center' | 'right';
  isBlur?: boolean;
  blurStrength?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

/**
 * Header 组件：网站的顶部导航栏。
 * 这是一个纯粹的展示性组件，其外观和行为由传入的 props 决定。
 * 通过移除 forwardRef，我们简化了组件的 API，因为它不再需要被外部测量。
 * @param {HeaderProps} props - 组件属性。
 */
const Header: React.FC<HeaderProps> = ({
  isVisible = true,
  isFixed = false,
  height = 'h-16',
  logo,
  logoPosition = 'left',
  isBlur = false,
  blurStrength = 'md',
}) => {
  if (!isVisible) {
    return null;
  }

  const baseHeaderClasses = [
    'text-foreground',
    'p-4',
    'shadow-soft',
    'border-b',
    'border-neutral-200',
    'w-full',
    'z-50',
    height,
    isFixed ? 'fixed top-0' : 'relative',
    'overflow-hidden',
  ];

  if (isBlur) {
    baseHeaderClasses.push(`bg-background/50`);
    baseHeaderClasses.push(`backdrop-blur-${blurStrength}`);
  } else {
    baseHeaderClasses.push('bg-background');
  }

  const finalHeaderClasses = baseHeaderClasses.join(' ');

  // 根据 Logo 位置动态调整 Flexbox 类
  let navClasses = 'flex items-center';
  if (logoPosition === 'left') {
    navClasses += ' justify-between'; // Logo 在左，ThemeToggle 在右
  } else if (logoPosition === 'center') {
    navClasses += ' justify-center'; // Logo 居中
  } else if (logoPosition === 'right') {
    navClasses += ' justify-between flex-row-reverse'; // Logo 在右，ThemeToggle 在左
  }

  const renderLogo = () => {
    if (logo.type === 'text') {
      return (
        <h1 className="text-2xl font-bold tracking-tight" style={{ width: logo.width === 'auto' ? 'auto' : logo.width }}>
          <Link
            href="/"
            className="text-primary hover:text-primary-dark transition-colors duration-200"
          >
            {logo.content}
          </Link>
        </h1>
      );
    } else if (logo.type === 'image') {
      const imgWidth = logo.width ? (parseInt(logo.width) || 100) : 100;
      const imgHeight = imgWidth / (16 / 9);

      return (
        <Link href="/">
          <Image
            src={logo.content}
            alt="Website Logo"
            width={imgWidth}
            height={imgHeight}
            className="h-full object-contain"
            style={{ width: logo.width === 'auto' ? 'auto' : logo.width }}
          />
        </Link>
      );
    }
    return null;
  };

  return (
    <header className={finalHeaderClasses}>
      <nav className={`container mx-auto ${navClasses} h-full`}>
        {/* Logo 渲染 */}
        {renderLogo()}

        {/* 右侧（或左侧）的切换按钮 */}
        <div className={`flex items-center ${logoPosition === 'center' ? 'absolute right-4 top-1/2 -translate-y-1/2' : ''}`}>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
