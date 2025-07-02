// src/lib/config.ts

// 定义 Logo 配置的接口
export interface HeaderLogoConfig {
    type: 'text' | 'image'; // Logo 类型：文字或图片
    content: string;        // Logo 内容：文字字符串或图片 URL
    width?: string;         // Logo 宽度 (可选，如 '120px', 'w-32')
}

// 定义 Header 配置的接口
export interface HeaderConfig {
    isVisible: boolean; // 控制 Header 是否显示
    isFixed: boolean;   // 控制 Header 是否固定在顶部
    height?: string;    // Header 高度 (可选，如 '64px', 'h-16')
    logo: HeaderLogoConfig; // Header Logo 配置
    logoPosition: 'left' | 'center' | 'right'; // Logo 位置
    isBlur?: boolean;       // 是否启用模糊透明效果
    blurStrength?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

// 新增：定义 Footer 配置的接口
export interface FooterConfig {
    isVisible: boolean; // 控制 Footer 是否显示
    text: string;       // Footer 显示的文本内容
    backgroundColor?: string; // Footer 背景颜色类名（例如 'bg-neutral-800'）
    textColor?: string;       // Footer 文本颜色类名（例如 'text-neutral-100'）
}

// 定义应用程序的整体配置接口
export interface AppConfig {
    header: HeaderConfig;
    footer: FooterConfig; // 新增：Footer 配置
    // 未来可以添加其他全局配置
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
        blurStrength: '3xl',
    },
    // 新增：Footer 的默认配置
    footer: {
        isVisible: true,
        text: `&copy; ${new Date().getFullYear()} 我的 Next.js 博客. 保留所有权利。`,
    },
    // 可以根据需要添加其他全局配置
};