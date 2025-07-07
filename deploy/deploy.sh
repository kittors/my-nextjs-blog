#!/bin/bash

# deploy.sh
# 统一的部署脚本，支持本地构建后部署或服务器端构建部署

# 定义部署文件路径（相对于脚本执行目录）
DEPLOY_DIR="$(dirname "$0")" # 获取脚本所在目录
PROJECT_ROOT="$(dirname "$DEPLOY_DIR")" # 项目根目录，即 my-nextjs-blog 目录

# 定义生成的 Dockerfile 和 Docker Compose 文件名
GENERATED_DOCKERFILE="Dockerfile"
GENERATED_DOCKER_COMPOSE_YML="docker-compose.yml"

# --- 部署方式介绍 ---
echo "--- Next.js 博客部署方式选择 ---"
echo ""
echo "1. **服务器构建部署 (Server Build Deployment)**"
echo "   原理：Docker 会在服务器上执行 Next.js 的完整构建过程 (pnpm install, pnpm build)。"
echo "   优点：部署命令简单，只需上传项目代码和部署脚本。"
echo "   缺点：对服务器的 CPU 和内存资源消耗较大，构建时间较长，不适合性能有限的服务器。"
echo ""
echo "2. **本地打包部署 (Local Build Deployment)**"
echo "   原理：你需要在本地机器上完成 Next.js 的构建 (pnpm install --prod, pnpm build)，"
echo "         然后将构建产物 (.next/, node_modules/ 等) 和必要的运行时文件上传到服务器。"
echo "         Docker 在服务器上只负责将这些预打包的文件复制到容器中并运行。"
echo "   优点：节省服务器资源，部署速度快，因为服务器不需要执行耗时的构建过程。"
echo "   缺点：需要额外的本地构建和文件传输步骤，上传的文件体积可能较大。"
echo ""

# --- 选择部署方式 ---
DEPLOY_METHOD=""
while [[ ! "$DEPLOY_METHOD" =~ ^[12]$ ]]; do
  read -p "请选择部署方式 (输入 1 或 2): " DEPLOY_METHOD
  if [[ ! "$DEPLOY_METHOD" =~ ^[12]$ ]]; then
    echo "无效的选择，请重新输入。"
  fi
done

# --- 选择暴露端口 ---
HOST_PORT=""
while true; do
  read -p "请输入你希望暴露的宿主机端口 (例如: 80, 8000, 3005): " HOST_PORT
  if [[ "$HOST_PORT" =~ ^[0-9]+$ ]] && [ "$HOST_PORT" -ge 1 ] && [ "$HOST_PORT" -le 65535 ]; then
    break
  else
    echo "无效的端口号，请输入一个 1 到 65535 之间的数字。"
  fi
done

# 核心新增：询问用户部署的公共 URL
PUBLIC_URL=""
while true; do
  read -p "请输入你的博客将通过哪个公共 URL 访问 (例如: http://yourdomain.com 或 http://your-server-ip:${HOST_PORT}): " PUBLIC_URL
  if [[ -n "$PUBLIC_URL" ]]; then # 检查输入是否为空
    break
  else
    echo "公共 URL 不能为空，请重新输入。"
  fi
done


# --- 根据选择生成 Dockerfile 和 Docker Compose 文件内容 ---
DOCKERFILE_CONTENT=""
DOCKER_COMPOSE_CONTENT=""

if [ "$DEPLOY_METHOD" == "1" ]; then
  echo "你选择了 '服务器构建部署' 方式。"
  echo "请确保你已将完整的 Next.js 项目代码和 'deploy' 文件夹上传到服务器的项目根目录。"
  
  # Dockerfile.server-build 的内容
  DOCKERFILE_CONTENT=$(cat <<EOF
# Dockerfile (方式一: 在服务器上构建 Next.js 应用并运行)

# --- 阶段 1: 依赖安装和构建 ---
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json, pnpm-lock.yaml 和 .npmrc
COPY package.json pnpm-lock.yaml .npmrc ./

# 在 builder 阶段，首次使用 pnpm 之前，先全局安装 pnpm
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
ENV NODE_ENV=production

# 在 runner 阶段也全局安装 pnpm，确保 pnpm 命令可用
RUN npm install -g pnpm

# 核心新增：设置 NEXT_PUBLIC_SITE_URL 环境变量。
# 这个变量在构建时会被 Next.js 用于生成图片的绝对 URL。
# 它的值将在 docker-compose.yml 中动态传入。
ENV NEXT_PUBLIC_SITE_URL http://localhost:3000 # 默认值，会被 docker-compose 覆盖

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
# 复制 posts 目录，这是存放所有 Markdown 博文的地方
COPY --from=builder /app/posts ./posts
# 复制 pnpm-lock.yaml 和 .npmrc 到 runner 阶段，以防 pnpm start 内部需要
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/.npmrc ./.npmrc

# 暴露应用程序运行的端口
EXPOSE 3000

# 启动 Next.js 应用程序
CMD ["pnpm", "start"]
EOF
)
  # docker-compose.server-build.yml 的内容
  DOCKER_COMPOSE_CONTENT=$(cat <<EOF
# docker-compose.yml (方式一: 用于服务器部署 - 构建)
version: '3.8'

services:
  nextjs-blog:
    build:
      context: .. # 构建上下文为上一级目录 (项目根目录)
      dockerfile: ./deploy/${GENERATED_DOCKERFILE} # 指向生成的 Dockerfile
    ports:
      - "${HOST_PORT}:3000" # 映射宿主机的动态端口到容器的 3000 端口
    restart: always
    environment:
      NODE_ENV: production
      # 核心新增：将公共 URL 传递给容器
      NEXT_PUBLIC_SITE_URL: "${PUBLIC_URL}"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
EOF
)

elif [ "$DEPLOY_METHOD" == "2" ]; then
  echo "你选择了 '本地打包部署' 方式。"
  echo "请确保你已在本地执行 'pnpm install --prod' 和 'pnpm run build'，"
  echo "并将所有必要的构建产物和 'deploy' 文件夹上传到服务器的项目根目录。"

  # Dockerfile.local-build 的内容
  DOCKERFILE_CONTENT=$(cat <<EOF
# Dockerfile (方式二: 本地构建，服务器运行)

# --- 阶段 1: 运行时镜像 ---
FROM node:20-alpine AS runner

# 设置工作目录
WORKDIR /app

# 设置 NODE_ENV 为 production，优化 Next.js 运行时
ENV NODE_ENV=production

# 在 runner 阶段全局安装 pnpm，确保 pnpm start 命令可用
RUN npm install -g pnpm

# 核心新增：设置 NEXT_PUBLIC_SITE_URL 环境变量。
# 这个变量在构建时会被 Next.js 用于生成图片的绝对 URL。
# 它的值将在 docker-compose.yml 中动态传入。
ENV NEXT_PUBLIC_SITE_URL http://localhost:3000 # 默认值，会被 docker-compose 覆盖

# 核心修正：从宿主机（服务器）的当前目录复制本地构建好的文件和必要的运行时文件
# 这些文件需要你在本地构建后手动上传到服务器上 docker-compose.yml 所在的目录的上一级
COPY ./.next ./.next
COPY ./public ./public
COPY ./node_modules ./node_modules
COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml
COPY ./.npmrc ./.npmrc
COPY ./middleware.ts ./middleware.ts
COPY ./posts ./posts
COPY ./src/i18n-config.ts ./src/i18n-config.ts
COPY ./src/lib ./src/lib
COPY ./src/locales ./src/locales

# 暴露应用程序运行的端口
EXPOSE 3000

# 启动 Next.js 应用程序
CMD ["pnpm", "start"]
EOF
)
  # docker-compose.local-build.yml 的内容
  DOCKER_COMPOSE_CONTENT=$(cat <<EOF
# docker-compose.yml (方式二: 用于服务器部署 - 运行本地构建)
version: '3.8'

services:
  nextjs-blog:
    build:
      context: .. # 构建上下文为上一级目录 (项目根目录)
      dockerfile: ./deploy/${GENERATED_DOCKERFILE} # 指向生成的 Dockerfile
    ports:
      - "${HOST_PORT}:3000" # 映射宿主机的动态端口到容器的 3000 端口
    restart: always
    environment:
      NODE_ENV: production
      # 核心新增：将公共 URL 传递给容器
      NEXT_PUBLIC_SITE_URL: "${PUBLIC_URL}"
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
EOF
)
fi

# --- 生成 Dockerfile 和 Docker Compose 文件 ---
echo "正在生成 ${GENERATED_DOCKERFILE} 和 ${GENERATED_DOCKER_COMPOSE_YML} 文件..."
echo "${DOCKERFILE_CONTENT}" > "${DEPLOY_DIR}/${GENERATED_DOCKERFILE}"
echo "${DOCKER_COMPOSE_CONTENT}" > "${DEPLOY_DIR}/${GENERATED_DOCKER_COMPOSE_YML}"

if [ $? -ne 0 ]; then
  echo "错误：无法生成 Docker Compose 或 Dockerfile 文件。请检查权限。"
  exit 1
fi

echo "文件已生成在 ${DEPLOY_DIR} 目录下。"

# --- 执行部署 ---
echo "--- 开始部署 ---"

# 切换到项目根目录执行 docker compose 命令，因为 context 是 ..
cd "$PROJECT_ROOT"

# 停止并移除旧的容器
echo "尝试停止并移除旧的容器..."
# 使用生成的 docker-compose.yml 文件来停止和移除
docker compose -f "${DEPLOY_DIR}/${GENERATED_DOCKER_COMPOSE_YML}" -p my-nextjs-blog down --remove-orphans || true

# 核心修正：添加短暂延时，确保文件系统变更被 Docker Compose 完全感知
sleep 1

# 构建并启动服务
echo "开始构建并启动 Next.js 博客服务..."
# 使用生成的 docker-compose.yml 文件来构建和启动
docker compose -f "${DEPLOY_DIR}/${GENERATED_DOCKER_COMPOSE_YML}" -p my-nextjs-blog build --no-cache --progress=plain && \
docker compose -f "${DEPLOY_DIR}/${GENERATED_DOCKER_COMPOSE_YML}" -p my-nextjs-blog up -d

# 检查服务状态
if [ $? -eq 0 ]; then
  echo "--- 部署成功！ ---"
  echo "你的 Next.js 博客已在宿主机的 ${HOST_PORT} 端口上运行。"
  echo "你可以通过 'docker compose -f ${DEPLOY_DIR}/${GENERATED_DOCKER_COMPOSE_YML} -p my-nextjs-blog logs -f' 查看日志。"
  echo "请访问 ${PUBLIC_URL}" # 核心修正：显示用户输入的公共 URL
else
  echo "--- 部署失败！ ---"
  echo "请检查上述错误信息和日志以进行故障排除。"
fi
