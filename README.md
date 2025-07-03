# 极简博客系统 (Minimalist Blog System)

这是一个使用 Next.js、React 和 TypeScript 构建的现代化、高性能的极简博客项目。项目遵循原子设计（Atomic Design）原则进行组件化开发，旨在打造一个结构清晰、易于维护和扩展的博客基础框架。

## ✨ 核心技术栈 (Core Technologies)

- **框架 (Framework):** [Next.js](https://nextjs.org/ 'null') 15 (App Router)
- **语言 (Language):** [TypeScript](https://www.typescriptlang.org/ 'null')
- **UI 库 (UI Library):** [React](https://react.dev/ 'null') 19
- **样式 (Styling):** [Tailwind CSS](https://tailwindcss.com/ 'null') 4
- **Markdown 解析:**
  - `gray-matter`: 解析 Markdown frontmatter 元数据。
  - `unified`, `remark-parse`, `remark-rehype`: 将 Markdown 转换为 HTML (HAST)。
- **代码高亮 (Syntax Highlighting):**
  - `shiki` & `rehype-pretty-code`: 提供美观、高性能的服务端代码高亮。
- **图标 (Icons):** [Lucide React](https://lucide.dev/ 'null')
- **开发工具 (Dev Tools):** ESLint, Prettier (通过编辑器集成)

## 📂 项目结构 (Project Structure)

项目遵循原子设计理念，将组件拆分为不同的层级，存放于 `src/components` 目录下：

- **`atoms` (原子):** 最基础的、不可再分的 UI 元素，如 `Button`, `Heading`, `Text`, `PostImage`。
- **`molecules` (分子):1** 由原子组合而成的简单 UI 组件，如 `BlogPostCard`, `ThemeToggle`, `ImagePreview`。
- **`organisms` (组织):** 由原子和分子构成的更复杂的、独立的页面区域，如 `Header`, `Footer`, `BlogList`, `TableOfContents`。
- **`templates` (模板):** 定义页面的整体布局结构，如 `PageContainer`, `BlogPostContent`。

这种结构使得组件的复用性、可测试性和可维护性都大大提高。

## 🚀 如何开始 (Getting Started)

请按照以下步骤在本地运行此项目：

**1. 克隆仓库**

```
git clone https://github.com/kittors/my-nextjs-blog
cd my-nextjs-blog

```

**2. 安装依赖** 项目推荐使用 `pnpm` 进行包管理。

```
pnpm install

```

如果你习惯使用 `npm` 或 `yarn`，也可以运行：

```
# 使用 npm
npm install

# 使用 yarn
yarn install

```

**3. 运行开发服务器**

```
pnpm dev

```

现在，在浏览器中打开 [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000 'null') 即可看到你的博客网站。

**4. 添加新文章** 只需在 `posts` 目录下创建一个新的 `.md` 文件，并按照现有文章的格式填写 `frontmatter` 即可。

## 🌟 当前版本功能 (Key Features)

- **Markdown 文章:** 所有博客文章均由 `posts` 目录下的 Markdown 文件驱动。
- **动态路由:** 根据 Markdown 文件名自动生成文章页面。
- **服务端代码高亮:** 使用 Shiki 实现高性能、美观的代码语法高亮。
- **明暗主题切换:** 支持亮色与暗色模式，并能记忆用户偏好，无刷新闪烁。
- **文章大纲 (TOC):** 自动生成文章大纲，并根据滚动位置高亮当前章节。
- **图片预览:** 点击文章中的图片可进行放大、缩小和旋转预览。
- **原子化组件设计:** 结构清晰，易于扩展和维护。
- **响应式布局:** 完美适配桌面、平板和移动设备。

## 🌱 未来开发与版本控制 (Future Development & Branching)

当前仓库中，`minimal-blog-v1` 分支是本项目的**稳定极简版本**。它的目标是提供一个干净、可靠的博客基础框架，仅包含核心功能。

`main` (或 `master`) 分支代表了项目的**最新稳定版本**，它会包含所有已完成并合并的功能。

为了在此基础上开发更复杂的功能，我们应该创建一个新的开发分支。这可以确保 `main` 分支的稳定性不受新功能开发的影响。

**未来开发功能计划：**

- [ ] **全局搜索 (Global Search):** 实现全站文章内容的搜索功能。
- [ ] **博文标签分类 (Blog Post Tag Categorization):** 支持为文章添加标签，并按标签进行分类和筛选。
- [ ] **评论区 (Comment Section):** 集成评论系统，允许用户在文章下方发表评论。

**请使用以下 Git 命令来创建并切换到一个新的开发分支：**

```
# 1. 确保你当前在主分支 (main 或 master)
git checkout main

# 2. 从主分支创建一个名为 'develop' 的新分支
git branch develop

# 3. 切换到新的 'develop' 分支
git checkout develop

# --- 或者，使用一条命令完成创建和切换 ---
git checkout -b develop

```

现在，你可以在 `develop` 分支上自由地进行新功能的开发。当新功能开发完成并测试稳定后，再通过 Pull Request 将其合并回 `main` 分支。
