// src/lib/dictionary.ts
import 'server-only';
// 核心修正：从 src/lib/config 导入 Locale 类型和 appConfig
import { appConfig, type Locale } from '@/lib/config';

// 定义一个类型，表示字典加载函数
type DictionaryLoader = () => Promise<any>;

// 核心修正：动态创建 dictionaries 对象。
// 这个映射现在会根据 appConfig.language.locales 中定义的语言列表，
// 自动为每种语言生成对应的字典加载函数。
// 这样，当您在 src/locales 目录下添加新的语言 JSON 文件时，
// 无需修改此文件，它会通过 appConfig.language.locales 自动识别并加载新语言的字典。
const dictionaries: Record<Locale, DictionaryLoader> = appConfig.language.locales.reduce(
  (acc, locale) => {
    // 使用模板字符串进行动态导入。
    // @ts-ignore: TypeScript 在编译时对动态导入的路径要求严格，
    // 但 Next.js 的打包工具能够正确处理这种模式，将每个语言的字典打包成独立的 chunk。
    acc[locale] = () => import(`@/locales/${locale}.json`).then(module => module.default);
    return acc;
  },
  {} as Record<Locale, DictionaryLoader>
); // 确保初始累加器是一个 Record 类型

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
  // 检查请求的 locale 是否在支持的字典中，如果不在，则回退到默认语言。
  // 这增加了函数的健壮性，防止因无效的 locale 参数导致程序崩溃。
  const loader = dictionaries[locale] || dictionaries[appConfig.language.defaultLocale];
  return loader();
};
