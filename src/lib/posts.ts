// src/lib/posts.ts
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
import { type Root as HastRoot, type Element, type Node, type Text } from 'hast';
import { type Root as MdastRoot } from 'mdast';
import { toString } from 'hast-util-to-string';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
// 核心修正：从 i18n-config.ts 导入 i18n 配置，而不是 appConfig
import { i18n } from '@/i18n-config';

// 接口定义
export interface TocEntry {
  level: number;
  id: string;
  text: string;
  offset: number;
}

export interface TagInfo {
  tag: string;
  count: number;
}

// 核心修改：为博文元数据添加 postId 和 lang
export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  tags?: string[];
  postId: string; // 语言无关的唯一ID
  lang: string; // 文章语言
}

// 核心修改：为返回的博文对象添加翻译信息
export interface BlogPost extends BlogPostMetadata {
  content: HastRoot;
  headings: TocEntry[];
  translations: {
    lang: string;
    slug: string;
    title: string;
  }[];
}

export interface SearchablePostData {
  metadata: BlogPostMetadata;
  plainTextContent: string;
  headings: TocEntry[];
}

const postsDirectory = path.join(process.cwd(), 'posts');
// 核心修正：直接使用 i18n.locales 作为支持的语言列表
const languages = i18n.locales;

let highlighter: Highlighter;
async function getSingletonHighlighter() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['vitesse-light', 'vitesse-dark'],
      langs: ['javascript', 'typescript', 'json', 'bash', 'css', 'html', 'java', 'python', 'md'],
    });
  }
  return highlighter;
}

function getTextFromNode(node: Node): string {
  if (node.type === 'text') {
    return (node as Text).value;
  }
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(getTextFromNode).join('');
  }
  return '';
}

// 辅助函数：从单个 .md 文件解析元数据
function getPostMetadataFromFile(lang: string, fileName: string): BlogPostMetadata {
  const slug = fileName.replace(/\.md$/, '');
  const fullPath = path.join(postsDirectory, lang, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data } = matter(fileContents);

  return {
    title: 'Untitled',
    date: new Date().toISOString(),
    author: 'Unknown',
    description: 'No description',
    tags: [],
    postId: slug, // 默认使用 slug 作为 postId
    ...data,
    lang,
    slug,
  } as BlogPostMetadata;
}

// 新函数：获取所有语言的所有文章元数据
function getAllPostsMetadata(): BlogPostMetadata[] {
  const allPosts: BlogPostMetadata[] = [];
  languages.forEach(lang => {
    const langDir = path.join(postsDirectory, lang);
    if (fs.existsSync(langDir)) {
      const fileNames = fs.readdirSync(langDir);
      fileNames.forEach(fileName => {
        if (fileName.endsWith('.md')) {
          allPosts.push(getPostMetadataFromFile(lang, fileName));
        }
      });
    }
  });
  return allPosts;
}

// 重构：按语言获取排序后的文章元数据
export function getSortedPostsMetadata(lang: string): BlogPostMetadata[] {
  const langDir = path.join(postsDirectory, lang);
  if (!fs.existsSync(langDir)) {
    return [];
  }
  const fileNames = fs.readdirSync(langDir);
  const allPostsMetadata = fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => getPostMetadataFromFile(lang, fileName));

  return allPostsMetadata.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// 重构：按语言获取所有标签
export function getAllTags(lang: string): TagInfo[] {
  const allPosts = getSortedPostsMetadata(lang);
  const tagCounts: { [key: string]: number } = {};
  allPosts.forEach(post => {
    post.tags?.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });
  const tags: TagInfo[] = Object.keys(tagCounts).map(tag => ({
    tag,
    count: tagCounts[tag],
  }));
  return tags.sort((a, b) => b.count - a.count);
}

// 重构：按 slug 和语言获取单篇文章
export async function getPostBySlug(slug: string, lang: string): Promise<BlogPost | null> {
  const decodedSlug = decodeURIComponent(slug);
  const fullPath = path.join(postsDirectory, lang, `${decodedSlug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const metadata = {
    title: 'Untitled',
    date: new Date().toISOString(),
    author: 'Unknown',
    description: 'No description',
    tags: [],
    postId: slug,
    ...data,
    lang,
    slug,
  } as BlogPostMetadata;

  // 查找翻译版本
  const allPosts = getAllPostsMetadata();
  const translations = allPosts
    .filter(p => p.postId === metadata.postId && p.lang !== metadata.lang)
    .map(p => ({ lang: p.lang, slug: p.slug, title: p.title }));

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
    .use(() => (tree: HastRoot) => {
      visit(tree, 'element', (node: Element) => {
        if (['h1', 'h2', 'h3'].includes(node.tagName) && node.properties?.id) {
          tempHeadings.push({
            level: parseInt(node.tagName.substring(1)),
            id: String(node.properties.id),
            text: getTextFromNode(node),
          });
        }
      });
    })
    .use(rehypePrettyCode, prettyCodeOptions)
    .use(rehypeCodeBlockHeader);

  const mdastTree = processor.parse(content) as MdastRoot;
  const hastTree = (await processor.run(mdastTree)) as HastRoot;
  const headings: TocEntry[] = tempHeadings.map(h => ({ ...h, offset: 0 }));

  return {
    ...metadata,
    content: hastTree,
    headings,
    translations, // 添加翻译信息
  };
}

// 新函数：获取所有文章的参数，用于 generateStaticParams
export function getAllPostsParams() {
  const allPosts = getAllPostsMetadata();
  return allPosts.map(post => ({
    lang: post.lang,
    slug: post.slug,
  }));
}

// 重构：按语言获取所有搜索数据
export async function getAllPostsForSearch(lang: string): Promise<SearchablePostData[]> {
  const langDir = path.join(postsDirectory, lang);
  if (!fs.existsSync(langDir)) {
    return [];
  }
  const fileNames = fs.readdirSync(langDir);
  const allSearchablePosts: SearchablePostData[] = [];

  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue;

    const slug = fileName.replace(/\.md$/, '');
    const post = await getPostBySlug(slug, lang);

    if (post) {
      let plainTextContent = toString(post.content);
      plainTextContent = plainTextContent
        .replace(/[`*~_]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const headingsWithOffset = post.headings.map(h => {
        const offset = plainTextContent.indexOf(h.text);
        return { ...h, offset: offset !== -1 ? offset : 0 };
      });

      allSearchablePosts.push({
        metadata: {
          slug: post.slug,
          title: post.title,
          date: post.date,
          author: post.author,
          description: post.description,
          tags: post.tags,
          postId: post.postId,
          lang: post.lang,
        },
        plainTextContent,
        headings: headingsWithOffset,
      });
    }
  }
  return allSearchablePosts;
}

// 插件：添加代码块头部 (此函数保持不变)
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
