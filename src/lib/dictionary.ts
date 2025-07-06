// src/lib/dictionary.ts
import 'server-only';
import type { Locale } from '@/i18n-config';

// 定义一个映射，将语言环境代码映射到其对应的字典模块。
// 使用动态导入 `() => import(...)` 来实现代码分割，
// 这样每个语言的字典只在被请求时才会被加载。
const dictionaries = {
  en: () => import('@/locales/en.json').then(module => module.default),
  zh: () => import('@/locales/zh.json').then(module => module.default),
};

/**
 * 异步获取指定语言环境的字典。
 *
 * @param {Locale} locale - 需要获取字典的语言环境代码 (例如 'en' 或 'zh')。
 * @returns {Promise<any>} 返回一个 Promise，解析为对应语言的字典对象。
 *
 * 这是一个遵循原子设计原则的纯函数，其唯一职责就是根据输入（locale）返回输出（字典），
 * 不产生任何副作用。动态导入的运用体现了对性能优化的考量。
 */
export const getDictionary = async (locale: Locale) => {
  // 检查请求的 locale 是否在支持的字典中，如果不在，则回退到 'en'。
  // 这增加了函数的健壮性，防止因无效的 locale 参数导致程序崩溃。
  const loader = dictionaries[locale] || dictionaries.en;
  return loader();
};
