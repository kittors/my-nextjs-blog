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
};

export default nextConfig;
