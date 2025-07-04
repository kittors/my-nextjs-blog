// src/components/organisms/Header.tsx
'use client';

import React from 'react'; // 不再需要 useState 和 useEffect
import Link from 'next/link';
import Image from 'next/image';
import { HeaderLogoConfig, appConfig } from '@/lib/config';
import ThemeToggle from '@/components/molecules/ThemeToggle';
import { Github, Search } from 'lucide-react';
import { useSearchModal } from '@/contexts/SearchModalContext';

interface HeaderProps {
  isVisible?: boolean;
  isFixed?: boolean;
  height?: string;
  logo: HeaderLogoConfig;
  logoPosition: 'left' | 'center' | 'right';
  isBlur?: boolean;
  // 新增 prop，用于接收确定的操作系统信息
  userOS: 'mac' | 'other';
}

const Header: React.FC<HeaderProps> = ({
  isVisible = true,
  isFixed = false,
  height = 'h-16',
  logo,
  logoPosition = 'left',
  isBlur = false,
  userOS, // 接收操作系统信息
}) => {
  const { github: githubConfig, search: searchConfig } = appConfig;
  const { openSearchModal } = useSearchModal();

  // 核心修正：直接根据从服务器传递来的 userOS prop 计算快捷键文本。
  // 不再需要任何客户端的状态或 effect，从而从根本上消除闪烁。
  const hotkeyText = userOS === 'mac' ? '⌘K' : 'Ctrl+K';

  if (!isVisible) {
    return null;
  }

  const baseHeaderClasses = [
    'text-foreground',
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
    baseHeaderClasses.push('bg-background', 'border-neutral-200', 'shadow-soft');
  }

  const finalHeaderClasses = baseHeaderClasses.join(' ');

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
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ width: logo.width === 'auto' ? 'auto' : logo.width }}
        >
          <Link
            href="/"
            className="
              inline-block
              bg-gradient-to-r
              from-[var(--header-logo-gradient-from)] to-[var(--header-logo-gradient-to)]
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
      const imgWidth = logo.width ? parseInt(logo.width) || 100 : 100;
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
      <nav className={`container mx-auto ${navClasses} h-full py-4`}>
        {renderLogo()}
        <div
          className={`flex items-center gap-4 ${logoPosition === 'center' ? 'absolute right-4 top-1/2 -translate-y-1/2' : ''}`}
        >
          {searchConfig.showHotkeyDisplay && (
            <button
              onClick={openSearchModal}
              className="flex items-center p-2 rounded-full header-icon-button transition-all"
              aria-label="搜索 (快捷键 Cmd/Ctrl + K)"
              title="搜索 (快捷键 Cmd/Ctrl + K)"
            >
              <Search size={20} />
              <span className="ml-2 text-sm font-medium hidden sm:inline-block">{hotkeyText}</span>
            </button>
          )}

          <ThemeToggle />

          {githubConfig.isVisible && (
            <Link
              href={githubConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full header-icon-button"
              aria-label="访问我的 GitHub"
              title="访问我的 GitHub"
            >
              <Github size={20} />
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
