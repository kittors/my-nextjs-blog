import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import { createHighlighter, type Highlighter } from 'shiki';
// 核心修正：移除不再需要的 'unist-util-visit' 和 HAST 类型，因为我们将不再手动操作 AST。
// import { visit } from 'unist-util-visit';
// import { type Root, type Element } from 'hast';

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

// 核心修正：完全移除自定义的 `rehypeCodeHeader` 插件。
// 这个插件是导致之前不稳定的根源。现在，服务器端只负责生成纯净的高亮代码，
// 将所有与头部相关的 UI 操作完全交给客户端处理，以确保稳定性和可预测性。

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

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const prettyCodeOptions: Partial<RehypePrettyCodeOptions> = {
    getHighlighter: getSingletonHighlighter,
    theme: { light: 'vitesse-light', dark: 'vitesse-dark' },
    onVisitLine(node) { // 类型可以从 rehype-pretty-code 推断
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: ' ' }];
      }
    },
  };

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypePrettyCode, prettyCodeOptions)
    // 核心修正：从处理管道中移除 .use(rehypeCodeHeader)。
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
