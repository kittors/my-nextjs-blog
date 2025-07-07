// src/components/organisms/Header.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// 核心修正：从 src/lib/config 导入 HeaderLogoConfig, appConfig 和 Locale 类型
import { HeaderLogoConfig, appConfig, type Locale } from '@/lib/config';
import ThemeToggle from '@/components/molecules/ThemeToggle';
import { Github, Search, MoreVertical, Tags } from 'lucide-react';
import { useSearchModal } from '@/contexts/SearchModalContext';
import DropdownMenu from '@/components/molecules/DropdownMenu';
import LanguageSwitcher from '@/components/molecules/LanguageSwitcher';

interface HeaderProps {
  isVisible?: boolean;
  isFixed?: boolean;
  height?: string;
  logo: HeaderLogoConfig;
  logoPosition: 'left' | 'center' | 'right';
  isBlur?: boolean;
  userOS: 'mac' | 'other';
  lang: Locale;
  dictionary: {
    tags: string;
    source_code: string;
    toggle_theme: string;
    language_switcher_label: string;
  };
}

/**
 * Header 组件：网站的顶部导航栏。
 *
 * @param {HeaderProps} props - 组件属性。
 */
const Header: React.FC<HeaderProps> = ({
  isVisible = true,
  isFixed = false,
  height = 'h-16',
  logo,
  logoPosition = 'left',
  isBlur = false,
  userOS,
  lang,
  dictionary,
}) => {
  const { github: githubConfig, search: searchConfig } = appConfig;
  const { openSearchModal } = useSearchModal();

  const hotkeyText = userOS === 'mac' ? '⌘K' : 'Ctrl+K';

  // 核心优化：languageSwitcherDictionary 现在只传递 label，
  // 具体的语言名称将由 LanguageSwitcher 组件直接从 appConfig 获取。
  const languageSwitcherDictionary = {
    label: dictionary.language_switcher_label,
  };

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
  if (logoPosition === 'left') navClasses += ' justify-between';
  else if (logoPosition === 'center') navClasses += ' justify-center';
  else if (logoPosition === 'right') navClasses += ' justify-between flex-row-reverse';

  const renderLogo = () => {
    // 核心修正：根据当前语言获取 logo 内容，如果当前语言没有，则回退到默认语言
    const logoContent = logo.content[lang] || logo.content[appConfig.language.defaultLocale];

    if (logo.type === 'text') {
      return (
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ width: logo.width === 'auto' ? 'auto' : logo.width }}
        >
          <Link
            href={`/${lang}`}
            className="inline-block bg-gradient-to-r from-[var(--header-logo-gradient-from)] to-[var(--header-logo-gradient-to)] bg-clip-text text-transparent hover:scale-105 hover:tracking-wide transition-all duration-300 ease-in-out"
          >
            {logoContent}
          </Link>
        </h1>
      );
    } else if (logo.type === 'image') {
      const imgWidth = logo.width ? parseInt(logo.width) || 100 : 100;
      const imgHeight = imgWidth / (16 / 9);
      return (
        <Link href={`/${lang}`}>
          <Image
            src={logoContent} // 使用多语言的图片路径
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
      <nav className={`container mx-auto px-4 ${navClasses} h-full py-4`}>
        {renderLogo()}
        <div
          className={`flex items-center gap-2 ${logoPosition === 'center' ? 'absolute right-4 top-1/2 -translate-y-1/2' : ''}`}
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

          {/* 将新创建的、类型正确的字典对象传递给 LanguageSwitcher */}
          <LanguageSwitcher lang={lang} dictionary={languageSwitcherDictionary} />

          <DropdownMenu
            activation="click"
            align="right"
            trigger={
              <button
                className="p-2 rounded-full header-icon-button flex items-center justify-center"
                aria-label="打开更多选项"
                title="更多选项"
              >
                <MoreVertical size={20} />
              </button>
            }
          >
            <Link href={`/${lang}/tags`} className="dropdown-item">
              <Tags size={16} />
              <span>{dictionary.tags}</span>
            </Link>

            {githubConfig.isVisible && (
              <a
                href={githubConfig.url}
                target="_blank"
                rel="noopener noreferrer"
                className="dropdown-item"
              >
                <Github size={16} />
                <span>{dictionary.source_code}</span>
              </a>
            )}
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default Header;
