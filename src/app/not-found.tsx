// src/app/not-found.tsx
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary';
import { headers } from 'next/headers'; // 只需导入 headers
import { appConfig, type Locale } from '@/lib/config';
import { Frown, Home } from 'lucide-react';
import Heading from '@/components/atoms/Heading';
import Text from '@/components/atoms/Text';

/**
 * 全局 NotFound 组件：处理整个应用程序的所有 404 错误。
 *
 * 最终架构方案（已确认）：
 * 此方案直接从触发 404 的原始 URL 中解析语言，这是最可靠的方法。
 *
 * 核心原理：
 * Next.js 在处理 404 时，`not-found` 组件无法像普通页面一样通过 `params` 获取动态路由参数。
 * 同时，读取 cookie 或其他请求头可能会得到上一个成功页面的“陈旧”状态，导致语言错乱。
 *
 * 唯一的“事实来源”是 Next.js 内部提供的 `next-url` 请求头，它包含了
 * 导致 404 的原始请求路径 (例如 `/en/non-existent-post`)。
 * 我们的逻辑现在只信任这个来源。
 *
 * @returns {Promise<JSX.Element>} 渲染后的 404 页面。
 */
export default async function NotFound() {
  // 核心修正：添加 await 关键字以正确解析 headers 对象，解决 TypeScript 报错。
  const headersList = await headers();

  // 只从 'next-url' header 中获取原始请求路径。这是最可靠的信息源。
  const requestPath = headersList.get('next-url') || '';

  let lang: Locale = appConfig.language.defaultLocale;

  // 从 URL 路径的第一个段落解析语言。
  // 例如，从 '/en/some/page' 中提取 'en'。
  if (requestPath) {
    const pathSegments = requestPath.split('/').filter(Boolean);
    if (pathSegments.length > 0 && appConfig.language.locales.includes(pathSegments[0] as Locale)) {
      lang = pathSegments[0] as Locale;
    }
  }

  // 如果 URL 中没有可识别的语言，则自动使用默认语言。
  // 这是预期的回退行为。

  const dictionary = await getDictionary(lang);

  return (
    <div className="container mx-auto flex h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12 text-center">
      <Frown size={80} className="mb-6 animate-pulse text-neutral-400 dark:text-neutral-600" />

      <Heading
        level={1}
        className="mb-4 text-6xl font-extrabold tracking-tighter text-neutral-900 dark:text-foreground"
      >
        404
      </Heading>
      <Heading
        level={2}
        className="mb-2 text-2xl font-semibold text-neutral-800 dark:text-neutral-200"
      >
        {dictionary.errors.page_not_found}
      </Heading>
      <Text className="mb-8 text-lg text-neutral-600 dark:text-neutral-400">
        {dictionary.errors.page_not_found_description}
      </Text>
      <Link
        href={`/${lang}`}
        className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary-default)] px-6 py-3 text-white shadow-md transition-colors duration-200 hover:bg-[var(--color-primary-dark)] hover:shadow-lg"
        aria-label={dictionary.errors.back_to_home}
        title={dictionary.errors.back_to_home}
      >
        <Home size={20} className="mr-2" />
        {dictionary.errors.back_to_home}
      </Link>
    </div>
  );
}
