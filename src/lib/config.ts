// src/lib/config.ts

// 定义 Logo 配置的接口
export interface HeaderLogoConfig {
  type: 'text' | 'image';
  // 核心修正：logo 内容现在是一个对象，键为语言代码，值为对应语言的文本或图片路径
  content: { [key: string]: string };
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

// 核心修正：定义首页标题区域的多语言配置接口
export interface HomePageConfig {
  title: { [key: string]: string }; // 标题现在是一个对象，键为语言代码，值为对应语言的标题
  subtitles: { [key: string]: string[] }; // 副标题现在是一个对象，键为语言代码，值为对应语言的副标题数组
}

// 核心新增：定义语言配置的接口
export interface LanguageConfig {
  languages: string[];
  defaultLanguage: string;
  languageLabels: { [key: string]: string };
}

// 定义应用程序的整体配置接口
export interface AppConfig {
  header: HeaderConfig;
  footer: FooterConfig;
  theme: ThemeConfig;
  search: SearchConfig;
  github: GithubConfig;
  homePage: HomePageConfig;
  language: LanguageConfig; // 核心新增：添加语言配置
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
      // 核心修正：logo content 现在支持多语言
      content: {
        zh: '我的博客',
        en: 'My Blog',
        // 核心新增：日语 Logo 文本
        ja: '私のブログ',
      },
      width: 'auto',
    },
    logoPosition: 'left',
    isBlur: true,
    blurStrength: 'lg',
  },
  footer: {
    isVisible: true,
    text: `footer.copyright`, // 将硬编码文本替换为字典键
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
    url: '[https://github.com/kittors](https://github.com/kittors)',
  },
  // 核心修正：首页多语言配置
  homePage: {
    title: {
      zh: '我的个人博客',
      en: 'My Personal Blog',
      // 核心新增：日语标题
      ja: '私の個人ブログ',
    },
    subtitles: {
      zh: [
        '分享我的思考、技术和生活。',
        '代码改变世界，思想照亮未来。',
        '保持好奇，持续学习。',
        'A Coder, A Writer, A Thinker.',
      ],
      en: [
        'Sharing my thoughts, technology, and life.',
        'Code changes the world, ideas light up the future.',
        'Stay curious, keep learning.',
        'A Coder, A Writer, A Thinker.',
      ],
      // 核心新增：日语副标题
      ja: [
        '私の思考、技術、そして生活を共有します。',
        'コードは世界を変え、思想は未来を照らす。',
        '好奇心を持ち続け、学び続けよう。',
        'A Coder, A Writer, A Thinker.',
      ],
    },
  },
  // 核心新增：语言相关的配置
  language: {
    // 核心修正：新增 'ja' 到支持的语言列表中
    languages: ['en', 'zh', 'ja'],
    defaultLanguage: 'zh',
    languageLabels: {
      en: 'English',
      zh: '简体中文',
      ja: '日本語',
    },
  },
};
