import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';
import { createHighlighter, type Highlighter } from 'shiki';
import { type Element } from 'hast';

// 定义文章大纲条目的接口
export interface TocEntry {
  level: number;
  id: string;
  text: string;
}

// 定义博客文章元数据的接口
export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
}

// 定义完整的博客文章接口，现在包含大纲
export interface BlogPost extends BlogPostMetadata {
  contentHtml: string;
  headings: TocEntry[]; // 新增：文章大纲
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

// 核心修正 1: 新增一个辅助函数，用于递归地从 HAST 节点树中提取所有文本内容。
// 这个函数能够处理嵌套的元素（如 `<code>` 标签），确保不会丢失任何文本。
function getTextFromNode(node: any): string {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(getTextFromNode).join('');
  }
  return '';
}

// 自定义 Rehype 插件，用于提取标题
function extractHeadings(headings: TocEntry[]) {
  return (tree: Element) => {
    visit(tree, 'element', (node) => {
      if (['h1', 'h2', 'h3'].includes(node.tagName)) {
        // 核心修正 2: 使用新的辅助函数来获取完整的标题文本。
        const text = getTextFromNode(node);
        
        if (node.properties?.id) {
          headings.push({
            level: parseInt(node.tagName.substring(1)),
            id: String(node.properties.id),
            text: text,
          });
        }
      }
    });
  };
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

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const decodedSlug = decodeURIComponent(slug);
  const fullPath = path.join(postsDirectory, `${decodedSlug}.md`);
  
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const headings: TocEntry[] = [];

  const prettyCodeOptions: Partial<RehypePrettyCodeOptions> = {
    getHighlighter: getSingletonHighlighter,
    theme: { light: 'vitesse-light', dark: 'vitesse-dark' },
    onVisitLine(node) {
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: ' ' }];
      }
    },
  };

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(() => extractHeadings(headings))
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    headings,
    ...(data as { title: string; date: string; author: string; description: string }),
  };
}

export function getAllPostSlugs(): { slug: string }[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}
