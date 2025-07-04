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

// ... (接口定义保持不变) ...
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
export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  tags?: string[];
}
export interface BlogPost extends BlogPostMetadata {
  content: HastRoot;
  headings: TocEntry[];
}
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

/**
 * 从 AST 节点中提取文本内容。
 * 遵循原子设计原则，这是一个纯函数，专注于单一职责：安全地从不同类型的 HAST 节点中获取文本。
 *
 * @param {Node} node - HAST 节点。可以是 Text 节点，也可以是包含 children 的 Element 节点。
 * @returns {string} 提取到的文本内容。
 */
function getTextFromNode(node: Node): string {
  // 核心修正：当节点类型为 'text' 时，明确地将其断言为 Text 类型，
  // 因为只有 Text 节点才拥有 'value' 属性。
  if (node.type === 'text') {
    return (node as Text).value;
  }
  // 如果节点有 'children' 属性（例如，它是一个 Element 节点），则递归处理其子节点。
  // 'children' in node 作为类型守卫，确保我们只在有 children 属性的节点上访问它。
  if ('children' in node && Array.isArray(node.children)) {
    return node.children.map(getTextFromNode).join('');
  }
  // 对于其他类型的节点（如 Comment 或 Doctype），返回空字符串。
  return '';
}

/**
 * Unified.js 插件：用于从 HAST 树中提取标题信息。
 * 遍历树中的 'h1', 'h2', 'h3' 元素，并收集它们的级别、ID 和文本内容。
 *
 * @param {Array<Omit<TocEntry, 'offset'>>} headings - 用于存储提取到的标题信息的数组。
 * @returns {function(HastRoot): void} Unified.js 插件函数。
 */
function extractHeadings(headings: Omit<TocEntry, 'offset'>[]) {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      // 明确类型为 Element，确保可以安全访问 tagName 和 properties
      if (['h1', 'h2', 'h3'].includes(node.tagName) && node.properties?.id) {
        headings.push({
          level: parseInt(node.tagName.substring(1)),
          id: String(node.properties.id),
          text: getTextFromNode(node), // 调用 getTextFromNode 获取标题文本
        });
      }
    });
  };
}

/**
 * Unified.js 插件：规范化代码块的语言类名。
 * 将 'language-Js' 这样的类名转换为 'language-javascript'，确保 Shiki 正确识别。
 *
 * @returns {function(HastRoot): void} Unified.js 插件函数。
 */
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

/**
 * Unified.js 插件：为 rehype-pretty-code 生成的代码块添加自定义头部。
 * 头部包含语言标签和复制按钮。
 *
 * @returns {function(HastRoot): void} Unified.js 插件函数。
 */
function rehypeCodeBlockHeader(): (tree: HastRoot) => void {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element) => {
      // 检查节点是否是 rehype-pretty-code 生成的 figure 元素
      if (
        node.tagName === 'figure' &&
        node.properties &&
        'data-rehype-pretty-code-figure' in node.properties
      ) {
        // 查找 figure 元素内的 pre 标签，它包含了实际的代码
        const preElement = node.children.find(
          (child): child is Element => child.type === 'element' && child.tagName === 'pre'
        );
        if (!preElement) return; // 如果没有找到 pre 标签，则跳过

        // 从 pre 标签的 data 属性中获取语言信息
        const lang = preElement.properties?.['data-language'] as string | undefined;
        if (!lang) return; // 如果没有语言信息，则跳过

        // 创建代码块的头部元素
        const header: Element = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['code-block-header'] },
          children: [
            // 语言标签
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['language-tag'] },
              children: [{ type: 'text', value: lang }],
            },
            // 复制按钮
            {
              type: 'element',
              tagName: 'button',
              properties: {
                className: ['copy-button'],
                'aria-label': 'Copy code to clipboard',
                'data-copy-button': 'true', // 用于 JavaScript 事件监听
              },
              children: [
                // 复制图标 (SVG)
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
                // 复制成功图标 (SVG)
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
        // 将创建的 header 元素添加到 figure 元素的子节点列表的开头
        node.children.unshift(header);
      }
    });
  };
}

/**
 * Unified.js 插件：解包 Markdown 中被 <p> 标签包裹的图片。
 * 这有助于 Next.js Image 组件的正确渲染，并避免不必要的嵌套。
 *
 * @returns {function(HastRoot): void} Unified.js 插件函数。
 */
function rehypeUnwrapImages() {
  return (tree: HastRoot) => {
    visit(tree, 'element', (node: Element, index: number | undefined, parent: Node | undefined) => {
      // 确保有父节点、索引有效且当前节点是 <p> 标签
      if (!parent || index === undefined || node.tagName !== 'p') {
        return;
      }
      // 过滤出有意义的子节点（非空文本节点或元素节点）
      const significantChildren = node.children.filter(child => {
        if (child.type === 'element') return true;
        if (child.type === 'text' && child.value.trim() !== '') return true;
        return false;
      });
      // 如果 <p> 标签只包含一个 <img> 标签作为唯一的有意义子节点，则解包
      if (
        significantChildren.length === 1 &&
        (significantChildren[0] as Element).tagName === 'img'
      ) {
        // 将 img 标签直接替换掉父节点中的 p 标签
        (parent as Element).children[index] = significantChildren[0];
      }
    });
  };
}

/**
 * 获取所有博客文章的元数据，并按日期降序排序。
 *
 * @returns {BlogPostMetadata[]} 排序后的博客文章元数据数组。
 */
export function getSortedPostsMetadata(): BlogPostMetadata[] {
  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsMetadata = fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, ''); // 从文件名中提取 slug
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents); // 解析 front matter
    // 核心修正：为 data 提供默认值，以防 matter 解析失败或文件为空
    const metadata = {
      title: '无标题',
      date: new Date().toISOString(),
      author: '未知作者',
      description: '暂无描述',
      tags: [],
      ...data, // 展开 front matter 数据，覆盖默认值
      slug, // 确保 slug 属性存在且正确
    } as BlogPostMetadata; // 类型断言为 BlogPostMetadata
    return metadata;
  });
  // 按日期降序排序 (最新文章在前)
  return allPostsMetadata.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * 获取所有文章中使用的标签及其计数。
 *
 * @returns {TagInfo[]} 标签信息数组，按计数降序排序。
 */
export function getAllTags(): TagInfo[] {
  const allPosts = getSortedPostsMetadata();
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

/**
 * 根据 slug 获取单篇博客文章的完整内容和元数据。
 *
 * @param {string} slug - 文章的 slug。
 * @returns {Promise<BlogPost>} 包含文章内容（HAST 树）和元数据的 Promise。
 */
export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const decodedSlug = decodeURIComponent(slug); // 解码 URL 编码的 slug
  const fullPath = path.join(postsDirectory, `${decodedSlug}.md`);

  // 核心修正：添加 try-catch 块来处理文件读取错误，并返回一个默认的错误文章。
  let fileContents: string;
  try {
    fileContents = fs.readFileSync(fullPath, 'utf8');
  } catch (error) {
    console.error(`Error reading post file for slug: ${slug}`, error);
    // 返回一个默认的错误文章，避免返回 undefined 导致后续 JSON.parse 报错
    return {
      slug: slug,
      title: '文章加载失败',
      date: new Date().toISOString(),
      author: '系统',
      description: '抱歉，无法加载此文章的内容。',
      content: {
        type: 'root',
        children: [
          {
            type: 'element',
            tagName: 'p',
            properties: {},
            children: [{ type: 'text', value: '无法找到或读取文章内容。' }],
          },
        ],
      },
      headings: [],
    };
  }

  const { data, content } = matter(fileContents); // 解析 front matter 和 Markdown 内容
  const tempHeadings: Omit<TocEntry, 'offset'>[] = []; // 临时存储标题信息

  // 核心修正：为 data 提供默认值，以防 matter 解析失败或文件为空
  const metadata = {
    title: '无标题',
    date: new Date().toISOString(),
    author: '未知作者',
    description: '暂无描述',
    tags: [],
    ...data, // 展开 front matter 数据，覆盖默认值
    slug, // 确保 slug 属性存在且正确
  } as BlogPostMetadata;

  // rehype-pretty-code 的配置选项
  const prettyCodeOptions: RehypePrettyCodeOptions = {
    getHighlighter: getSingletonHighlighter, // 获取 Shiki highlighter 实例
    theme: { light: 'vitesse-light', dark: 'vitesse-dark' }, // 定义亮色和暗色主题
    onVisitLine(node) {
      // 如果行是空的，插入一个空格以确保行号正确显示
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: ' ' }];
      }
    },
  };

  // 构建 Unified.js 处理器管道
  const processor = unified()
    .use(remarkParse) // 将 Markdown 解析为 MDAST
    .use(remarkGfm) // 支持 GitHub Flavored Markdown
    .use(remarkMath) // 支持数学公式
    .use(remarkRehype, { allowDangerousHtml: true }) // 将 MDAST 转换为 HAST，允许不安全的 HTML
    .use(rehypeUnwrapImages) // 解包被 p 标签包裹的图片
    .use(rehypeSlug) // 为标题添加 slug ID
    .use(rehypeKatex) // 渲染 KaTeX 数学公式
    .use(() => extractHeadings(tempHeadings)) // 提取标题信息
    .use(normalizeCodeLanguage) // 规范化代码语言类名
    .use(rehypePrettyCode, prettyCodeOptions) // 代码高亮
    .use(rehypeCodeBlockHeader); // 添加代码块头部

  const mdastTree = processor.parse(content) as MdastRoot; // 解析 Markdown 内容为 MDAST
  const hastTree = (await processor.run(mdastTree)) as HastRoot; // 运行插件并转换为 HAST

  // 将临时标题信息转换为 TocEntry 数组
  const headings: TocEntry[] = tempHeadings.map(h => ({ ...h, offset: 0 }));

  return {
    ...metadata, // 使用经过默认值处理的元数据
    content: hastTree, // 文章内容（HAST 树）
    headings, // 提取到的标题列表
  } as BlogPost; // 类型断言为 BlogPost
}

/**
 * 获取所有文章的 slug 列表，用于 Next.js 的 `generateStaticParams`。
 *
 * @returns {{ slug: string }[]} 包含所有文章 slug 的数组。
 */
export function getAllPostSlugs(): { slug: string }[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map(fileName => ({
    slug: fileName.replace(/\.md$/, ''), // 从文件名中提取 slug
  }));
}

/**
 * 获取所有文章的搜索数据，包括元数据、纯文本内容和标题信息。
 * 用于客户端的搜索功能。
 *
 * @returns {Promise<SearchablePostData[]>} 包含所有文章搜索数据的 Promise。
 */
export async function getAllPostsForSearch(): Promise<SearchablePostData[]> {
  const fileNames = fs.readdirSync(postsDirectory);
  const allSearchablePosts: SearchablePostData[] = [];

  for (const fileName of fileNames) {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(postsDirectory, fileName);

    // 核心修正：添加 try-catch 块来处理文件读取错误，并跳过有问题的文章。
    let fileContents: string;
    try {
      fileContents = fs.readFileSync(fullPath, 'utf8');
    } catch (error) {
      console.error(`Error reading search data file for slug: ${slug}. Skipping this post.`, error);
      continue; // 跳过此文章，继续处理下一篇文章
    }

    const { data, content } = matter(fileContents);
    const tempHeadings: Omit<TocEntry, 'offset'>[] = [];

    // 核心修正：为 data 提供默认值，以防 matter 解析失败或文件为空
    const metadata = {
      title: '无标题',
      date: new Date().toISOString(),
      author: '未知作者',
      description: '暂无描述',
      tags: [],
      ...data, // 展开 front matter 数据，覆盖默认值
      slug, // 确保 slug 属性存在且正确
    } as BlogPostMetadata;

    // 创建一个专门用于提取纯文本内容的处理器（不包含代码高亮等）
    const textProcessor = unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkRehype)
      .use(rehypeSlug)
      // 核心修正：为 extractHeadings 提供明确的类型，解决 'Unexpected any' 错误。
      // extractHeadings 接受一个 Omit<TocEntry, 'offset'>[] 类型的数组。
      .use(() => extractHeadings(tempHeadings)); // 明确类型

    const mdastTreeForText = textProcessor.parse(content) as MdastRoot;
    const hastTreeForText = (await textProcessor.run(mdastTreeForText)) as HastRoot;

    // 将 HAST 树转换为纯文本
    let plainTextContent = toString(hastTreeForText);
    // 清理 Markdown 标记和多余空格
    plainTextContent = plainTextContent
      .replace(/[`*~_]/g, '') // 移除常见的 Markdown 格式标记
      .replace(/\s+/g, ' ') // 将多个空格替换为单个空格
      .trim(); // 移除首尾空白

    // 计算标题在纯文本内容中的偏移量
    const headings: TocEntry[] = tempHeadings.map(h => {
      const offset = plainTextContent.indexOf(h.text);
      return { ...h, offset: offset !== -1 ? offset : 0 };
    });

    allSearchablePosts.push({
      metadata: metadata, // 使用经过默认值处理的元数据
      plainTextContent,
      headings,
    });
  }
  return allSearchablePosts;
}
