// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Webpack 配置保持不变
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(/^prismjs($|\/)/);
    }
    return config;
  },

  // 核心修正：添加 images 配置
  // 为了允许 next/image 组件加载来自 pexels.com 的图片，
  // 我们需要将它的主机名添加到允许的域名列表中。
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  /**
   * 核心新增：配置重定向规则。
   * 这个异步函数定义了从一个路径到另一个路径的重定向。
   * 我们将根路径 '/' 永久重定向到 '/splash.html'。
   * 这将确保当用户访问网站根目录时，直接显示加载动画页面。
   */
  async redirects() {
    return [
      {
        source: '/', // 匹配所有对根路径的请求
        destination: '/splash.html', // 重定向到 splash.html
        permanent: true, // 使用永久重定向 (HTTP 308 状态码)，浏览器会缓存此重定向
      },
    ];
  },
};

export default nextConfig;
