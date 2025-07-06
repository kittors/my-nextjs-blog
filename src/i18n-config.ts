// i18n-config.ts

/**
 * i18n (国际化) 配置文件。
 *
 * 遵循原子设计原则，我们将所有与 i18n 相关的核心配置集中在此处。
 * 这样做的好处是：
 * 1.  **单一数据源 (Single Source of Truth)**: 所有关于支持语言、默认语言的定义都源于此文件，
 * 避免了在多个文件中重复声明，降低了维护成本和出错风险。
 * 2.  **高内聚**: i18n 的配置逻辑被封装在一个独立的模块中，使得系统结构更清晰。
 * 3.  **易于扩展**: 当需要支持新语言时，只需修改此文件即可，无需触及其他业务逻辑代码。
 */

// 定义支持的语言环境列表
export const i18n = {
  defaultLocale: 'zh',
  locales: ['en', 'zh', 'ja'],
} as const;

// 从配置中导出 Locale 类型，确保整个应用中的类型安全
export type Locale = (typeof i18n)['locales'][number];
