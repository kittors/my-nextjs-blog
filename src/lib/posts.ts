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
import { toString } from 'hast-util-to-string'; // 导入 hast-util-to-string 用于提取纯文本

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

// 定义完整的博客文章接口，现在包含处理过的内容
export interface BlogPost extends BlogPostMetadata {
  content: HastRoot; // 内容现在是 HAST 树
  headings: TocEntry[]; // 文章大纲
}

// 新增：定义用于搜索的文章数据接口
export interface SearchablePostData {
  metadata: BlogPostMetadata;
  plainTextContent: string;
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

/**
 * 从 AST 节点中提取文本内容。
 * 递归遍历节点的子节点以获取所有文本。
 * @param {any} node - AST 节点。
 * @returns {string} 提取的文本内容。
 */
function getTextFromNode(node: any): string {
  if (node.type === 'text') {
    return node.value;
  }
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(getTextFromNode).join('');
  }
  return '';
}

/**
 * 提取文章中的标题并填充到 headings 数组中。
 * 这是一个 rehype 插件，用于遍历 HAST 树。
 * @param {TocEntry[]} headings - 用于存储提取到的标题的数组。
 */
function extractHeadings(headings: TocEntry[]) {
  return (tree: HastRoot) => {
    visit(tree, 'element', node => {
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

/**
 * 获取所有博客文章的元数据，并按日期降序排序。
 * @returns {BlogPostMetadata[]} 排序后的博客文章元数据数组。
 */
export function getSortedPostsMetadata(): BlogPostMetadata[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsMetadata = fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);
    return {
      slug,
      ...(matterResult.data as {
        title: string;
        date: string;
        author: string;
        description: string;
      }),
    };
  });
  return allPostsMetadata.sort((a, b) => (a.date < b.date ? 1 : -1));
}

/**
 * 根据 slug 获取单篇博客文章的详细内容（HAST 树和标题大纲）。
 * @param {string} slug - 文章的 slug。
 * @returns {Promise<BlogPost>} 包含文章内容和元数据的 Promise。
 */
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

  // 创建统一的处理器实例
  const processor = unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(() => extractHeadings(headings))
    .use(rehypePrettyCode, prettyCodeOptions);

  // 正确地分步执行解析和转换
  const mdastTree = processor.parse(content) as MdastRoot;
  const hastTree = await processor.run(mdastTree);

  return {
    slug,
    content: hastTree as HastRoot,
    headings,
    ...(data as { title: string; date: string; author: string; description: string }),
  };
}

/**
 * 获取所有博客文章的 slug。
 * @returns {{ slug: string }[]} 包含所有文章 slug 的数组。
 */
export function getAllPostSlugs(): { slug: string }[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}

/**
 * 新增函数：获取所有文章的元数据和纯文本内容。
 * 这个函数将在构建时运行，为客户端搜索提供数据。
 * @returns {Promise<SearchablePostData[]>} 包含所有文章可搜索数据的 Promise。
 */
export async function getAllPostsForSearch(): Promise<SearchablePostData[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allSearchablePosts: SearchablePostData[] = [];

  for (const fileName of fileNames) {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // 修正：将 Markdown 内容转换为 HAST 树，然后从 HAST 树中提取纯文本
    const processor = unified().use(remarkParse).use(remarkRehype);
    const mdastTree = processor.parse(content) as MdastRoot;
    const hastTree = await processor.run(mdastTree); // 确保这里是 await
    const plainTextContent = toString(hastTree); // 使用 toString 提取纯文本

    allSearchablePosts.push({
      metadata: {
        slug,
        ...(data as { title: string; date: string; author: string; description: string }),
      },
      plainTextContent,
    });
  }

  return allSearchablePosts;
}
