// src/app/[lang]/not-found.tsx
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary';
import { headers } from 'next/headers';
import { type Locale } from '@/i18n-config';
import { i18n } from '@/i18n-config';
import { appConfig } from '@/lib/config'; // 核心新增：导入 appConfig

export default async function NotFound() {
  const headersList = await headers();
  // 核心修正：尝试从 Referer 头或 User-Agent 中推断语言，或者使用默认语言
  // 这种方法更健壮，因为 _not-found 页面可能没有直接的 [lang] 参数
  const referer = headersList.get('referer');
  let lang: Locale = i18n.defaultLocale; // 默认使用配置中的默认语言

  if (referer) {
    try {
      const url = new URL(referer);
      // 从路径中提取语言前缀
      const pathSegments = url.pathname.split('/').filter(Boolean); // 过滤空字符串
      if (pathSegments.length > 0 && i18n.locales.includes(pathSegments[0] as Locale)) {
        lang = pathSegments[0] as Locale;
      }
    } catch (e) {
      console.error('无效的 Referer URL:', referer, e);
    }
  }

  // 如果 Referer 无法提供有效语言，或者直接访问了不存在的路径（没有 Referer），
  // 可以尝试从 User-Agent 的 Accept-Language 中获取，但这在服务器组件中更复杂。
  // 最简单的回退是使用 appConfig 中的默认语言。

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
      <Link
        href={`/${lang}`}
        className="inline-block rounded-md bg-primary px-6 py-3 text-lg font-medium text-white shadow-md transition-transform hover:scale-105"
      >
        {dictionary.errors.back_to_home || 'Back to Home'}
      </Link>
    </div>
  );
}
