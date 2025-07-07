// src/components/molecules/LanguageSwitcher.tsx
'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
// 核心修正：从 src/lib/config 导入 appConfig 和 Locale 类型
import { appConfig, type Locale } from '@/lib/config';
import DropdownMenu from '@/components/molecules/DropdownMenu';
import { Languages } from 'lucide-react';

// 定义 LanguageSwitcher 的 Props 接口
interface LanguageSwitcherProps {
  lang: Locale;
  dictionary: {
    label: string; // 只需要语言切换器的通用标签，具体的语言名称从 appConfig 获取
  };
}

/**
 * LanguageSwitcher 组件：一个原子级别的 UI 组件，用于切换网站语言。
 *
 * 它负责渲染一个语言选择的下拉菜单，并处理语言切换时的路由逻辑。
 * 目前，它通过替换 URL 中的语言前缀来工作。
 *
 * 核心优化：
 * 语言的显示名称（如 "English", "简体中文"）现在直接从 `appConfig.language.languageLabels` 获取，
 * 不再依赖于 `dictionary` prop。这消除了在每个 `locales` JSON 文件中重复定义语言名称的需要，
 * 从而简化了添加新语言时的配置。
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
      {/* 核心修正：使用 appConfig.language.locales 替代 i18n.locales */}
      {appConfig.language.locales.map(locale => (
        <button
          key={locale}
          onClick={() => handleLanguageChange(locale)}
          // 核心修正：为菜单项提供更清晰的样式，并正确禁用当前语言
          // 将激活状态的类从 Tailwind 的 'font-semibold text-primary' 更改为自定义的 'active-language-item'。
          // 'active-language-item' 类已在 src/styles/components/dropdown-menu.css 中定义，
          // 包含亮色和暗色模式下的样式。
          className={`dropdown-item w-full text-left justify-start ${lang === locale ? 'active-language-item' : ''}`}
          disabled={lang === locale}
        >
          {/* 核心优化：直接从 appConfig.language.languageLabels 获取语言的完整名称 */}
          {appConfig.language.languageLabels[locale]}
        </button>
      ))}
    </DropdownMenu>
  );
}
