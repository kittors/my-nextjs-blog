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
  // blurStrength prop 不再需要，因为样式被硬编码在 .header-blur 类中
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

  // 核心修正：不再使用一长串 Tailwind 类，而是直接应用我们自定义的 .header-blur 类
  if (isBlur) {
    baseHeaderClasses.push('header-blur');
  } else {
    // 当不启用模糊时，回退到原始的实体背景样式
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
        {renderLogo()}
        <div className={`flex items-center ${logoPosition === 'center' ? 'absolute right-4 top-1/2 -translate-y-1/2' : ''}`}>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};

export default Header;
