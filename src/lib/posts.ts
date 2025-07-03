import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { visit } from 'unist-util-visit';
import { createHighlighter, type Highlighter } from 'shiki';
import { type Root as HastRoot } from 'hast';
import { type Root as MdastRoot } from 'mdast';

// 定义文章大纲条目的接口
export interface TocEntry {
  level: number;
  id: string;
  text: string;
}

// 定义博客文章元数据的接口
export interface BlogPostMetadata {
  slug: string;
  title:string;
  date: string;
  author: string;
  description: string;
}

// 定义完整的博客文章接口，现在包含处理过的内容
export interface BlogPost extends BlogPostMetadata {
  content: HastRoot; // 内容现在是 HAST 树
  headings: TocEntry[]; // 文章大纲
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

function getTextFromNode(node: any): string {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(getTextFromNode).join('');
  }
  return '';
}

function extractHeadings(headings: TocEntry[]) {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node) => {
      if (['h1', 'h2', 'h3'].includes(node.tagName)) {
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

  // 修正：创建统一的处理器实例
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(() => extractHeadings(headings))
    .use(rehypePrettyCode, prettyCodeOptions);

  // 修正：正确地分步执行解析和转换
  const mdastTree = processor.parse(content) as MdastRoot;
  const hastTree = await processor.run(mdastTree);

  return {
    slug,
    content: hastTree as HastRoot,
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
