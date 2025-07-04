// src/lib/config.ts

// 定义 Logo 配置的接口
export interface HeaderLogoConfig {
  type: 'text' | 'image';
  content: string;
  width?: string;
}

// 定义 Header 配置的接口
export interface HeaderConfig {
  isVisible: boolean;
  isFixed: boolean;
  height?: string;
  logo: HeaderLogoConfig;
  logoPosition: 'left' | 'center' | 'right';
  isBlur?: boolean;
  blurStrength?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

// 定义 Footer 配置的接口
export interface FooterConfig {
  isVisible: boolean;
  text: string;
  backgroundColor?: string;
  textColor?: string;
}

// 定义主题配置的接口
export interface ThemeConfig {
  defaultToSystemPreference: boolean;
  initialTheme: 'light' | 'dark' | 'system';
}

// 定义搜索配置的接口
export interface SearchConfig {
  hotkey: string;
  showHotkeyDisplay: boolean;
}

// 定义 GitHub 配置的接口
export interface GithubConfig {
  isVisible: boolean;
  url: string;
}

// 核心新增：定义首页标题区域的配置接口
export interface HomePageConfig {
  title: string;
  subtitles: string[];
}

// 定义应用程序的整体配置接口
export interface AppConfig {
  header: HeaderConfig;
  footer: FooterConfig;
  theme: ThemeConfig;
  search: SearchConfig;
  github: GithubConfig;
  homePage: HomePageConfig; // 核心新增：添加首页配置
}

/**
 * 应用程序的全局配置。
 */
export const appConfig: AppConfig = {
  header: {
    isVisible: true,
    isFixed: true,
    height: 'h-16',
    logo: {
      type: 'text',
      content: '我的博客',
      width: 'auto',
    },
    logoPosition: 'left',
    isBlur: true,
    blurStrength: 'lg',
  },
  footer: {
    isVisible: true,
    text: `&copy; ${new Date().getFullYear()} 我的 Next.js 博客. 保留所有权利。`,
  },
  theme: {
    defaultToSystemPreference: false,
    initialTheme: 'system',
  },
  search: {
    hotkey: 'k',
    showHotkeyDisplay: true,
  },
  github: {
    isVisible: true,
    url: 'https://github.com/kittors',
  },
  // 核心新增：首页内容的配置
  homePage: {
    title: '我的个人博客',
    subtitles: [
      '分享我的思考、技术和生活。',
      '代码改变世界，思想照亮未来。',
      '保持好奇，持续学习。',
      'A Coder, A Writer, A Thinker.',
    ],
  },
};
