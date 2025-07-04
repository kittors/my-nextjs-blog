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
import { type Root as HastRoot, type Element } from 'hast';
import { type Root as MdastRoot } from 'mdast';
import { toString } from 'hast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// 定义文章大纲条目的接口
export interface TocEntry {
  level: number;
  id: string;
  text: string;
  offset: number;
}

// 核心新增：定义单个标签信息的接口
export interface TagInfo {
  tag: string;
  count: number;
}

// 定义博客文章元数据的接口
export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  tags?: string[]; // 核心新增：tags 是一个可选的字符串数组
}

// 定义完整的博客文章接口
export interface BlogPost extends BlogPostMetadata {
  content: HastRoot;
  headings: TocEntry[];
}

// 定义用于搜索的文章数据接口
export interface SearchablePostData {
  metadata: BlogPostMetadata;
  plainTextContent: string;
  headings: TocEntry[];
}

const postsDirectory = path.join(process.cwd(), 'posts');

let highlighter: Highlighter;
async function getSingletonHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['vitesse-light', 'vitesse-dark'],
      langs: ['javascript', 'typescript', 'json', 'bash', 'css', 'html', 'java', 'python'],
    });
  }
  return highlighter;
}

function getTextFromNode(node: any): string {
  if (node.type === 'text') return node.value;
  if (node.children && Array.isArray(node.children)) {
    return node.children.map(getTextFromNode).join('');
  }
  return '';
}

function extractHeadings(headings: Omit<TocEntry, 'offset'>[]) {
  return (tree: HastRoot) => {
    visit(tree, 'element', node => {
      if (['h1', 'h2', 'h3'].includes(node.tagName) && node.properties?.id) {
        headings.push({
          level: parseInt(node.tagName.substring(1)),
          id: String(node.properties.id),
          text: getTextFromNode(node),
        });
      }
    });
  };
}

function normalizeCodeLanguage() {
  return (tree: HastRoot) => {
    visit(tree, 'element', node => {
      if (
        node.tagName === 'code' &&
        node.properties?.className &&
        Array.isArray(node.properties.className)
      ) {
        const classNames = node.properties.className as string[];
        const langClassIndex = classNames.findIndex(cls => cls.startsWith('language-'));
        if (langClassIndex !== -1) {
          const lang = classNames[langClassIndex].substring('language-'.length);
          classNames[langClassIndex] = `language-${lang.toLowerCase()}`;
          node.properties.className = classNames;
        }
      }
    });
  };
}

function rehypeCodeBlockHeader(): (tree: HastRoot) => void {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      if (
        node.tagName === 'figure' &&
        node.properties &&
        'data-rehype-pretty-code-figure' in node.properties
      ) {
        const preElement = node.children.find(
          (child): child is Element => child.type === 'element' && child.tagName === 'pre'
        );
        if (!preElement) return;
        const lang = preElement.properties?.['data-language'] as string | undefined;
        if (!lang) return;
        const header: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-block-header'] },
          children: [
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['language-tag'] },
              children: [{ type: 'text', value: lang }],
            },
            {
              type: 'element',
              tagName: 'button',
              properties: {
                className: ['copy-button'],
                'aria-label': 'Copy code to clipboard',
                'data-copy-button': 'true',
              },
              children: [
                {
                  type: 'element',
                  tagName: 'svg',
                  properties: {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: '16',
                    height: '16',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: '2',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    className: ['copy-icon'],
                  },
                  children: [
                    {
                      type: 'element',
                      tagName: 'path',
                      properties: {
                        d: 'M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2',
                      },
                      children: [],
                    },
                    {
                      type: 'element',
                      tagName: 'rect',
                      properties: { x: '8', y: '2', width: '8', height: '4', rx: '1', ry: '1' },
                      children: [],
                    },
                  ],
                },
                {
                  type: 'element',
                  tagName: 'svg',
                  properties: {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: '16',
                    height: '16',
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: '2',
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    className: ['check-icon'],
                  },
                  children: [
                    {
                      type: 'element',
                      tagName: 'polyline',
                      properties: { points: '20 6 9 17 4 12' },
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        };
        node.children.unshift(header);
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
    const { data } = matter(fileContents);
    return {
      slug,
      ...(data as BlogPostMetadata),
    };
  });
  return allPostsMetadata.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * 核心新增：获取所有唯一标签及其关联文章数量的函数。
 * @returns {TagInfo[]} 一个包含所有标签信息的数组，按关联文章数量降序排序。
 */
export function getAllTags(): TagInfo[] {
  const allPosts = getSortedPostsMetadata();
  const tagCounts: { [key: string]: number } = {};

  // 遍历所有文章，统计每个标签出现的次数
  allPosts.forEach(post => {
    post.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // 将统计结果转换为 TagInfo 数组
  const tags: TagInfo[] = Object.keys(tagCounts).map(tag => ({
    tag,
    count: tagCounts[tag],
  }));

  // 按关联文章数量降序排序
  return tags.sort((a, b) => b.count - a.count);
}

export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const decodedSlug = decodeURIComponent(slug);
  const fullPath = path.join(postsDirectory, `${decodedSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  const tempHeadings: Omit<TocEntry, 'offset'>[] = [];

  const prettyCodeOptions: RehypePrettyCodeOptions = {
    getHighlighter: getSingletonHighlighter,
    theme: { light: 'vitesse-light', dark: 'vitesse-dark' },
    onVisitLine(node) {
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: ' ' }];
      }
    },
  };

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(() => extractHeadings(tempHeadings))
    .use(normalizeCodeLanguage)
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeCodeBlockHeader);

  const mdastTree = processor.parse(content) as MdastRoot;
  const hastTree = (await processor.run(mdastTree)) as HastRoot;

  const headings: TocEntry[] = tempHeadings.map(h => ({ ...h, offset: 0 }));

  return {
    slug,
    content: hastTree,
    headings,
    ...(data as BlogPostMetadata),
  };
}

export function getAllPostSlugs(): { slug: string }[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => ({
    slug: fileName.replace(/\.md$/, ''),
  }));
}

export async function getAllPostsForSearch(): Promise<SearchablePostData[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allSearchablePosts: SearchablePostData[] = [];
  for (const fileName of fileNames) {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);
    const tempHeadings: Omit<TocEntry, 'offset'>[] = [];
    const textProcessor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeSlug)
      .use(() => extractHeadings(tempHeadings));
    const mdastTreeForText = textProcessor.parse(content) as MdastRoot;
    const hastTreeForText = (await textProcessor.run(mdastTreeForText)) as HastRoot;
    let plainTextContent = toString(hastTreeForText);
    plainTextContent = plainTextContent
      .replace(/[`*~_]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const headings: TocEntry[] = tempHeadings.map(h => {
      const offset = plainTextContent.indexOf(h.text);
      return { ...h, offset: offset !== -1 ? offset : 0 };
    });
    allSearchablePosts.push({
      metadata: {
        slug,
        ...(data as BlogPostMetadata),
      },
      plainTextContent,
      headings,
    });
  }
  return allSearchablePosts;
}
