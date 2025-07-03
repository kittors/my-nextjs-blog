// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // 移除 react 和 react-dom 的别名，pnpm 的 overrides 提供了更可靠的解决方案。
    // 这使得 webpack 配置更简洁，并依赖包管理器来处理版本统一。

    // 对于服务器端构建，将 prismjs 标记为外部依赖，这是一个好的实践，可以减小 server bundle 的体积。
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(
        /^prismjs($|\/)/,
      );
    }
    return config;
  },
};

export default nextConfig;
