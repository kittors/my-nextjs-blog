// src/components/organisms/Header.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeaderLogoConfig } from '@/lib/config';
import ThemeToggle from '@/components/molecules/ThemeToggle';

// Props 类型定义保持不变
interface HeaderProps {
  isVisible?: boolean;
  isFixed?: boolean;
  height?: string;
  logo: HeaderLogoConfig;
  logoPosition: 'left' | 'center' | 'right';
  isBlur?: boolean;
}

/**
 * Header 组件：网站的顶部导航栏。
 * @param {HeaderProps} props - 组件属性。
 */
const Header: React.FC<HeaderProps> = ({
  isVisible = true,
  isFixed = false,
  height = 'h-16',
  logo,
  logoPosition = 'left',
  isBlur = false,
}) => {
  if (!isVisible) {
    return null;
  }

  // 基础样式保持不变
  const baseHeaderClasses = [
    'text-foreground',
    'p-4',
    'border-b',
    'w-full',
    'z-50',
    height,
    isFixed ? 'fixed top-0' : 'relative',
    'transition-all duration-300',
  ];

  if (isBlur) {
    baseHeaderClasses.push('header-blur');
  } else {
    baseHeaderClasses.push(
      'bg-background',
      'border-neutral-200',
      'shadow-soft'
    );
  }

  const finalHeaderClasses = baseHeaderClasses.join(' ');

  // 导航和 Logo 渲染逻辑保持不变
  let navClasses = 'flex items-center';
  if (logoPosition === 'left') {
    navClasses += ' justify-between';
  } else if (logoPosition === 'center') {
    navClasses += ' justify-center';
  } else if (logoPosition === 'right') {
    navClasses += ' justify-between flex-row-reverse';
  }

  const renderLogo = () => {
    if (logo.type === 'text') {
      return (
        <h1 className="text-2xl font-bold tracking-tight" style={{ width: logo.width === 'auto' ? 'auto' : logo.width }}>
          {/* 核心修正：为 Logo 链接添加了丰富的悬停效果 */}
          <Link
            href="/"
            className="
              inline-block
              bg-gradient-to-r from-blue-600 to-purple-600 
              dark:from-blue-400 dark:to-purple-400
              bg-clip-text text-transparent
              hover:scale-105 hover:tracking-wide
              transition-all duration-300 ease-in-out
            "
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
        {renderLogo()}
        <div className={`flex items-center ${logoPosition === 'center' ? 'absolute right-4 top-1/2 -translate-y-1/2' : ''}`}>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
