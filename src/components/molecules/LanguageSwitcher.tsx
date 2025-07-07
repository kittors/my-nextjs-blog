// src/components/molecules/LanguageSwitcher.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { appConfig, type Locale } from '@/lib/config';
import DropdownMenu from '@/components/molecules/DropdownMenu';
import { Languages } from 'lucide-react';

interface LanguageSwitcherProps {
  lang: Locale;
  dictionary: {
    label: string;
  };
}

/**
 * LanguageSwitcher 组件（最终版）：
 *
 * 核心架构：
 * 此组件现在通过 localStorage 与 BlogPostContent 组件通信，以实现智能的、
 * 上下文感知的语言切换，同时保证了流畅的客户端路由体验。
 *
 * 新逻辑：
 * 1.  当用户切换语言时，首先检查 localStorage 中是否存在 'postTranslations'。
 * 2.  如果存在（意味着当前在博客文章页）：
 * a. 尝试查找目标语言的翻译版本。
 * b. 如果找到，则无缝导航到该翻译版本的文章 URL。
 * c. 如果未找到，则优雅地导航到目标语言的主页。
 * 3.  如果不存在（意味着不在博客文章页）：
 * a. 则执行标准的回退逻辑，即替换当前 URL 的语言部分。
 */
export default function LanguageSwitcher({ lang, dictionary }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    const storedTranslationsRaw = localStorage.getItem('postTranslations');

    // 场景一: 在博客文章页面 (localStorage 中有翻译信息)
    if (storedTranslationsRaw) {
      try {
        const translations: { lang: string; slug: string }[] = JSON.parse(storedTranslationsRaw);
        const targetTranslation = translations.find(t => t.lang === newLocale);

        if (targetTranslation) {
          // 找到了对应的翻译文章，直接跳转
          router.replace(`/${newLocale}/blog/${targetTranslation.slug}`);
        } else {
          // 当前文章没有目标语言的翻译，跳转到该语言的首页
          router.replace(`/${newLocale}`);
        }
      } catch (e) {
        console.error('解析 localStorage 中的翻译信息失败:', e);
        // 解析失败时，也安全地跳转到首页
        router.replace(`/${newLocale}`);
      }
    }
    // 场景二: 不在博客文章页面
    else {
      if (!pathname) return;
      const segments = pathname.split('/');
      segments[1] = newLocale;
      const newPath = segments.join('/');
      router.replace(newPath);
    }
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
      {appConfig.language.locales.map(locale => (
        <button
          key={locale}
          onClick={() => handleLanguageChange(locale)}
          className={`dropdown-item w-full text-left justify-start ${lang === locale ? 'active-language-item' : ''}`}
          disabled={lang === locale}
        >
          {appConfig.language.languageLabels[locale]}
        </button>
      ))}
    </DropdownMenu>
  );
}
