// src/app/[lang]/not-found.tsx
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary';
import { headers } from 'next/headers';
import { type Locale } from '@/i18n-config';
import { i18n } from '@/i18n-config';

export default async function NotFound() {
  // 核心修正：添加 await。根据您的 TypeScript 报错，headers() 函数被识别为了一个 Promise。
  const headersList = await headers();
  // 从 URL 或 header 中推断语言, 提供一个默认值以增加健壮性
  const langHeader = headersList.get('x-next-intl-locale');
  const lang: Locale = i18n.locales.includes(langHeader as any)
    ? (langHeader as Locale)
    : i18n.defaultLocale;

  const dictionary = await getDictionary(lang);

  return (
    <div className="container mx-auto flex h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-6xl font-extrabold tracking-tighter text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
        {dictionary.errors.post_not_found}
      </h2>
      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
        {dictionary.errors.post_not_found_description}
      </p>
      {/* 核心修正：使用字典中的翻译文本。请确保您的 en.json/zh.json 中包含 errors.back_to_home 键。 */}
      <Link
        href={`/${lang}`}
        className="inline-block rounded-md bg-primary px-6 py-3 text-lg font-medium text-white shadow-md transition-transform hover:scale-105"
      >
        {dictionary.errors.back_to_home || 'Back to Home'}
      </Link>
    </div>
  );
}
