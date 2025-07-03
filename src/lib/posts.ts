import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import { Element } from 'hast';
import { createHighlighter, type Highlighter } from 'shiki';

// 定义博客文章元数据的接口
export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
}

// 定义完整的博客文章接口
export interface BlogPost extends BlogPostMetadata {
  contentHtml: string;
}

const postsDirectory = path.join(process.cwd(), 'posts');

// 终极解决方案：创建一个全局单例的 Highlighter
// 这可以确保 Highlighter 只被初始化一次，并在多次调用 getPostBySlug 之间共享。
// 这是在无服务器环境或构建流程中使用 Shiki 的最高效、最可靠的方式。
let highlighter: Highlighter;
async function getSingletonHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['vitesse-light', 'vitesse-dark'],
      langs: ['javascript', 'typescript', 'json', 'bash', 'css', 'html'],
    });
  }
  return highlighter;
}


export function getSortedPostsMetadata(): BlogPostMetadata[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsMetadata = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    return {
      slug,
      ...(matterResult.data as { title: string; date: string; author: string; description: string }),
    };
  });
  return allPostsMetadata.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * 根据文章的 slug 获取单篇博客文章的完整内容。
 * 使用 rehype-pretty-code 在服务器端生成带语法高亮的 HTML。
 * @param {string} slug - 文章的唯一标识符（slug）。
 * @returns {Promise<BlogPost>} 包含文章元数据和高亮后的 HTML 内容。
 */
export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // 配置 rehype-pretty-code
  const prettyCodeOptions: Partial<RehypePrettyCodeOptions> = {
    // 核心修正：根据 TypeScript 错误提示，将属性名从 `highlighter` 改为 `getHighlighter`。
    // 我们直接传递创建单例实例的异步函数，这符合 getHighlighter 的期望类型。
    getHighlighter: getSingletonHighlighter,
    theme: {
      light: 'vitesse-light',
      dark: 'vitesse-dark',
    },
    onVisitLine(node: Element) {
      // 防止空行在 `display: grid` 模式下被折叠
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: ' ' }];
      }
    },
  };

  // 处理 Markdown
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    ...(data as { title: string; date: string; author: string; description: string }),
  };
}

export function getAllPostSlugs(): { slug: string }[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}
