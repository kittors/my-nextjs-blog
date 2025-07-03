// src/components/organisms/Header.tsx
'use client'; // 确保这是客户端组件

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeaderLogoConfig, appConfig } from '@/lib/config';
import ThemeToggle from '@/components/molecules/ThemeToggle';
import { Github, Search } from 'lucide-react';
import { useSearchModal } from '@/contexts/SearchModalContext';

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
  // 从 appConfig 中获取新的配置项
  const { github: githubConfig, search: searchConfig } = appConfig;
  const { openSearchModal } = useSearchModal();

  // 用于存储平台特定的快捷键文本，初始值为空格，避免 SSR 时的闪烁和布局跳动
  const [hotkeyText, setHotkeyText] = useState('\u00A0'); // 使用非中断空格 &nbsp;

  useEffect(() => {
    // 在客户端检测操作系统并设置快捷键文本
    // 这个 useEffect 仅在客户端环境运行一次
    if (typeof navigator !== 'undefined') {
      setHotkeyText(/Mac|iPod|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl+K');
    }
  }, []); // 空依赖数组确保只在组件挂载时执行一次

  if (!isVisible) {
    return null;
  }

  // 基础样式保持不变
  const baseHeaderClasses = [
    'text-foreground',
    // 核心修正：从 <header> 标签上移除 p-4，让 h-16 准确控制总高度
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
      {/* 核心修正：将 py-4 添加到 <nav> 标签，以保持内容垂直居中和内边距 */}
      <nav className={`container mx-auto ${navClasses} h-full py-4`}>
        {renderLogo()}
        <div
          className={`flex items-center gap-4 ${logoPosition === 'center' ? 'absolute right-4 top-1/2 -translate-y-1/2' : ''}`}
        >
          {/* 搜索图标 + 快捷键提示 */}
          {searchConfig.showHotkeyDisplay && (
            <button
              onClick={openSearchModal}
              // 核心优化：header-icon-button 类已在 theme.css 中添加 cursor: pointer
              className="flex items-center p-2 rounded-full header-icon-button"
              aria-label="搜索 (快捷键 Cmd/Ctrl + K)"
              title="搜索 (快捷键 Cmd/Ctrl + K)"
            >
              <Search size={20} />
              <span className="ml-2 text-sm font-medium hidden sm:inline-block">
                {/* 核心优化：hotkeyText 初始为非中断空格，客户端水合后更新为平台特定值，避免闪烁 */}
                {hotkeyText}
              </span>
            </button>
          )}

          {/* ThemeToggle 保持不变，位于搜索和 GitHub 之间 */}
          <ThemeToggle />

          {/* GitHub 图标 */}
          {githubConfig.isVisible && (
            <Link
              href={githubConfig.url}
              target="_blank"
              rel="noopener noreferrer"
              // 核心优化：header-icon-button 类已在 theme.css 中添加 cursor: pointer
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
