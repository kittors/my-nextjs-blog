// next.config.ts
import type { NextConfig } from "next";
import path from "path"; // 导入 path 模块

const nextConfig: NextConfig = {
  // Webpack 配置保持不变
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(/^prismjs($|\/)/);
    }
    return config;
  },

  // 新增 PostCSS 配置
  // 这一部分是解决问题的关键。
  // 我们通过配置 postcss-import 插件，并为其提供一个解析路径，
  // 使得 PostCSS 能够理解和处理 `@/` 这样的路径别名。
  // 注意：Next.js 13+ 之后，对 PostCSS 的自定义配置方式可能有所变化，
  // 但通过 webpack 配置来影响 PostCSS 插件是更底层和稳定的做法。
  // 然而，更简单的方式是直接修改 CSS 的导入方式，我们将在下一步骤中看到。
  // 考虑到项目的简洁性，我们优先采用修改 CSS 的方式。
  // 此处保留 webpack 配置的完整性。
};

export default nextConfig;
