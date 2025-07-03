// src/lib/config.ts

// 定义 Logo 配置的接口
export interface HeaderLogoConfig {
  type: 'text' | 'image'; // Logo 类型：文字或图片
  content: string; // Logo 内容：文字字符串或图片 URL
  width?: string; // Logo 宽度 (可选，如 '120px', 'w-32')
}

// 定义 Header 配置的接口
export interface HeaderConfig {
  isVisible: boolean; // 控制 Header 是否显示
  isFixed: boolean; // 控制 Header 是否固定在顶部
  height?: string; // Header 高度 (可选，如 '64px', 'h-16')
  logo: HeaderLogoConfig; // Header Logo 配置
  logoPosition: 'left' | 'center' | 'right'; // Logo 位置
  isBlur?: boolean; // 是否启用模糊透明效果
  blurStrength?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

// 定义 Footer 配置的接口
export interface FooterConfig {
  isVisible: boolean; // 控制 Footer 是否显示
  text: string; // Footer 显示的文本内容
  backgroundColor?: string; // Footer 背景颜色类名（例如 'bg-neutral-800'）
  textColor?: string; // Footer 文本颜色类名（例如 'text-neutral-100'）
}

// 新增：定义主题配置的接口
export interface ThemeConfig {
  // 是否默认与系统主题偏好同步。
  // 如果为 true，系统偏好将具有最高优先级。
  defaultToSystemPreference: boolean;
  // 如果不默认与系统同步，或者系统偏好不可用时，使用的初始主题。
  // 'light' | 'dark' | 'system' (如果 defaultToSystemPreference 为 true，此项应为 'system')
  initialTheme: 'light' | 'dark' | 'system';
  // 是否允许用户手动切换主题。
  // 如果为 false，主题将完全由 defaultToSystemPreference 和 initialTheme 控制。
  enableManualToggle: boolean;
}

// 定义应用程序的整体配置接口
export interface AppConfig {
  header: HeaderConfig;
  footer: FooterConfig;
  theme: ThemeConfig; // 新增：主题配置
}

/**
 * 应用程序的全局配置。
 * 这是一个单一的配置源，可以在整个应用中引用。
 */
export const appConfig: AppConfig = {
  header: {
    isVisible: true,
    isFixed: true, // 保持固定在顶部，以便观察模糊效果
    height: 'h-16',
    logo: {
      type: 'text',
      content: '我的博客',
      width: 'auto',
    },
    logoPosition: 'left',
    isBlur: true, // 默认启用模糊透明效果
    // 核心修正：将模糊强度从 '3xl' (过于模糊) 调整为 'lg' (16px)。
    // 这个值通常能提供最佳的“毛玻璃”效果，既能模糊背景，又能保留轮廓感。
    blurStrength: 'lg',
  },
  // Footer 的默认配置
  footer: {
    isVisible: true,
    text: `&copy; ${new Date().getFullYear()} 我的 Next.js 博客. 保留所有权利。`,
  },
  // 新增：主题的默认配置
  theme: {
    defaultToSystemPreference: true, // 核心修复：将此设置为 true，以默认同步系统主题
    initialTheme: 'system', // 如果同步，初始主题设为 'system'
    enableManualToggle: true, // 默认允许手动切换
  },
};
