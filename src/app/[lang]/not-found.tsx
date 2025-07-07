// src/app/[lang]/not-found.tsx
import Link from 'next/link';
import { getDictionary } from '@/lib/dictionary';
import { headers } from 'next/headers';
// 核心修正：从 src/lib/config 导入 Locale 类型和 appConfig
import { appConfig, type Locale } from '@/lib/config';
// 核心新增：导入 Lucide React 图标，用于增强视觉通用性
import { ArrowLeft } from 'lucide-react'; // 将 Home 替换为 ArrowLeft 图标

/**
 * NotFound 组件：自定义 404 页面。
 * 此组件现在设计为语言通用，通过字典获取文本，并使用图标来减少对特定语言文本的依赖。
 */
export default async function NotFound() {
  const headersList = await headers();
  // 尝试从 Referer 头或 User-Agent 中推断语言，或者使用默认语言。
  // 这种方法更健壮，因为 _not-found 页面可能没有直接的 [lang] 参数。
  const referer = headersList.get('referer');
  let lang: Locale = appConfig.language.defaultLocale; // 默认使用配置中的默认语言

  if (referer) {
    try {
      const url = new URL(referer);
      // 从路径中提取语言前缀
      const pathSegments = url.pathname.split('/').filter(Boolean); // 过滤空字符串
      // 使用 appConfig.language.locales 检查语言是否受支持
      if (
        pathSegments.length > 0 &&
        appConfig.language.locales.includes(pathSegments[0] as Locale)
      ) {
        lang = pathSegments[0] as Locale;
      }
    } catch (e) {
      console.error('无效的 Referer URL:', referer, e);
    }
  }

  // 不需要获取字典，因为页面将不再显示任何文本描述
  // const dictionary = await getDictionary(lang); // 移除此行

  return (
    <div className="container mx-auto flex h-[calc(100vh-10rem)] flex-col items-center justify-center px-4 py-12 text-center">
      {/* 核心修正：移除通用地球图标 */}
      {/* <Globe size={80} className="text-neutral-400 dark:text-neutral-600 mb-6 animate-pulse" /> */}

      {/* 核心修正：将 404 文本颜色调整为在亮色模式下为中性黑，暗黑模式下为中性白 */}
      <h1 className="text-6xl font-extrabold tracking-tighter text-neutral-900 dark:text-foreground mb-4">
        404
      </h1>
      {/* 核心修正：移除所有文本描述 */}
      {/* <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
        {dictionary.errors.post_not_found}
      </h2>
      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
        {dictionary.errors.post_not_found_description}
      </p> */}
      <Link
        href={`/${lang}`}
        // 核心修正：调整按钮样式，移除圆形背景，使其只显示图标。
        // 使用 bg-transparent 和 text-neutral-900/dark:text-foreground 来确保图标颜色随主题变化。
        // 移除 shadow-md 和 transition-transform hover:scale-105，使其更像一个纯粹的图标链接。
        className="inline-flex items-center justify-center p-2 rounded-md bg-transparent text-neutral-900 dark:text-foreground hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors duration-200"
        aria-label="返回首页" // 添加无障碍标签
        title="返回首页" // 添加工具提示
      >
        {/* 核心修正：将 Home 图标替换为 ArrowLeft 图标 */}
        <ArrowLeft size={24} /> {/* 增大图标尺寸以适应无文本布局 */}
        {/* {dictionary.errors.back_to_home || 'Back to Home'} */}
      </Link>
    </div>
  );
}
