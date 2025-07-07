# Dockerfile

# --- 阶段 1: 依赖安装和构建 ---
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json, pnpm-lock.yaml 和 .npmrc
COPY package.json pnpm-lock.yaml .npmrc ./

# 核心修正：在 builder 阶段，首次使用 pnpm 之前，先全局安装 pnpm
RUN npm install -g pnpm

# 安装生产依赖和开发依赖 (用于构建)
# 使用 --frozen-lockfile 确保严格按照 lock 文件安装
RUN pnpm install --frozen-lockfile

# 复制所有项目文件到工作目录
COPY . .

# 执行 Next.js 构建
# 这将生成生产优化过的文件到 .next 目录
RUN pnpm run build

# --- 阶段 2: 运行时镜像 ---
FROM node:20-alpine AS runner

# 设置工作目录
WORKDIR /app

# 设置 NODE_ENV 为 production，优化 Next.js 运行时
ENV NODE_ENV production

# 核心修正：在 runner 阶段也全局安装 pnpm
# 尽管我们只使用 pnpm start，但为了确保 pnpm 命令可用，这是最可靠的方式
RUN npm install -g pnpm

# 复制 .next 目录 (构建产物) 从 builder 阶段
COPY --from=builder /app/.next ./.next
# 复制 public 目录 (静态文件) 从 builder 阶段
COPY --from=builder /app/public ./public
# 复制 package.json (用于获取 start 脚本和依赖信息)
COPY --from=builder /app/package.json ./package.json
# 复制 node_modules (生产依赖) 从 builder 阶段
COPY --from=builder /app/node_modules ./node_modules
# 复制 middleware.ts (如果你的 middleware 依赖运行时环境)
COPY --from=builder /app/middleware.ts ./middleware.ts
# 复制 i18n-config.ts 和 lib (如果它们在运行时被引用且不是构建的一部分)
COPY --from=builder /app/src/i18n-config.ts ./src/i18n-config.ts
COPY --from=builder /app/src/lib ./src/lib
COPY --from=builder /app/src/locales ./src/locales
# 核心修正：复制 posts 目录，这是存放所有 Markdown 博文的地方
COPY --from=builder /app/posts ./posts
# 复制 pnpm-lock.yaml 和 .npmrc 到 runner 阶段，以防 pnpm start 内部需要（通常不需要，但更安全）
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/.npmrc ./.npmrc


# 暴露应用程序运行的端口
EXPOSE 3000

# 启动 Next.js 应用程序
CMD ["pnpm", "start"]
