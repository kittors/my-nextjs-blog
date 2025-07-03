// src/components/organisms/Header.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { HeaderLogoConfig, appConfig } from '@/lib/config'; // 导入 appConfig
import ThemeToggle from '@/components/molecules/ThemeToggle';
import { Github, Search } from 'lucide-react'; // 导入 Github 和 Search 图标
import { useSearchModal } from '@/contexts/SearchModalContext'; // 导入 useSearchModal hook

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
  const { openSearchModal } = useSearchModal(); // 使用 useSearchModal hook

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
      <nav className={`container mx-auto ${navClasses} h-full`}>
        {renderLogo()}
        <div
          className={`flex items-center gap-4 ${logoPosition === 'center' ? 'absolute right-4 top-1/2 -translate-y-1/2' : ''}`}
        >
          {/* 优化点 2: 搜索图标 + 快捷键提示 */}
          {searchConfig.showHotkeyDisplay && (
            <button
              onClick={openSearchModal} // 点击按钮打开搜索模态框
              className="flex items-center text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors duration-200 p-2 rounded-full"
              aria-label="搜索 (快捷键 Cmd/Ctrl + K)"
              title="搜索 (快捷键 Cmd/Ctrl + K)"
            >
              <Search size={20} />
              <span className="ml-2 text-sm font-medium hidden sm:inline-block">
                {/* 根据操作系统显示不同的快捷键提示 */}
                {typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform)
                  ? '⌘K'
                  : 'Ctrl+K'}
              </span>
            </button>
          )}

          {/* ThemeToggle 保持不变，位于搜索和 GitHub 之间 */}
          <ThemeToggle />

          {/* 优化点 1: GitHub 图标 */}
          {githubConfig.isVisible && (
            <Link
              href={githubConfig.url}
              target="_blank" // 在新标签页打开
              rel="noopener noreferrer" // 安全最佳实践
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 transition-colors duration-200 p-2 rounded-full"
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
