// src/components/molecules/LanguageSwitcher.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { i18n, type Locale } from '@/i18n-config';
import DropdownMenu from '@/components/molecules/DropdownMenu';
import { Languages } from 'lucide-react';

// 定义 LanguageSwitcher 的 Props 接口
interface LanguageSwitcherProps {
  lang: Locale;
  dictionary: {
    label: string;
    en: string;
    zh: string;
  };
}

/**
 * LanguageSwitcher 组件：一个原子级别的 UI 组件，用于切换网站语言。
 *
 * 它负责渲染一个语言选择的下拉菜单，并处理语言切换时的路由逻辑。
 * 目前，它通过替换 URL 中的语言前缀来工作。
 *
 * @param {LanguageSwitcherProps} props - 组件属性。
 */
export default function LanguageSwitcher({ lang, dictionary }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    if (!pathname) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    // 使用 router.replace() 而不是 router.push()，
    // 这样切换语言不会在浏览器历史记录中创建新条目。
    router.replace(newPath);
  };

  return (
    <DropdownMenu
      activation="click"
      align="right"
      trigger={
        <button
          className="p-2 rounded-full header-icon-button flex items-center justify-center"
          aria-label={dictionary.label}
          title={dictionary.label}
        >
          <Languages size={20} />
        </button>
      }
    >
      {i18n.locales.map(locale => (
        <button
          key={locale}
          onClick={() => handleLanguageChange(locale)}
          // 核心修正：为菜单项提供更清晰的样式，并正确禁用当前语言
          className={`dropdown-item w-full text-left justify-start ${lang === locale ? 'font-semibold text-primary' : ''}`}
          disabled={lang === locale}
        >
          {/* 从字典中获取语言的完整名称 */}
          {dictionary[locale as keyof typeof dictionary]}
        </button>
      ))}
    </DropdownMenu>
  );
}
