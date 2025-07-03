import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { visit, SKIP } from 'unist-util-visit';
import { createHighlighter, type Highlighter } from 'shiki';
import { type Root as HastRoot } from 'hast';
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
  offset: number; // 标题在 plainTextContent 中的起始偏移量
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

// 定义用于搜索的文章数据接口，包含 headings
export interface SearchablePostData {
  metadata: BlogPostMetadata;
  plainTextContent: string;
  headings: TocEntry[]; // 添加 headings
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
 * 这个插件只负责从 HAST 树中识别标题并获取其 ID 和文本。
 * 偏移量将在后续步骤中根据 plainTextContent 重新计算。
 * @param {TocEntry[]} headings - 用于存储提取到的标题的数组。
 */
function extractHeadings(headings: Omit<TocEntry, 'offset'>[]) {
  return (tree: HastRoot) => {
    visit(tree, 'element', node => {
      // 确保节点有 ID 并且是标题标签 (h1, h2, h3)
      if (['h1', 'h2', 'h3'].includes(node.tagName) && node.properties?.id) {
        const text = getTextFromNode(node);
        headings.push({
          level: parseInt(node.tagName.substring(1)),
          id: String(node.properties.id),
          text: text,
        });
      }
    });
  };
}

/**
 * 标准化代码块的语言类名。
 * 将 `<code>` 标签上的 `language-` 类名转换为小写，以兼容 Shiki 的语言识别。
 */
function normalizeCodeLanguage() {
  return (tree: HastRoot) => {
    visit(tree, 'element', node => {
      // 查找 <code> 标签，并确保它有 className 属性且为数组
      if (
        node.tagName === 'code' &&
        node.properties?.className &&
        Array.isArray(node.properties.className)
      ) {
        const classNames = node.properties.className as string[];
        const languageClassIndex = classNames.findIndex(cls => cls.startsWith('language-'));

        if (languageClassIndex !== -1) {
          const originalLangClass = classNames[languageClassIndex];
          // 提取语言标识符并转换为小写
          const langIdentifier = originalLangClass.substring('language-'.length);
          const normalizedLangClass = `language-${langIdentifier.toLowerCase()}`;

          // 更新类名数组
          classNames[languageClassIndex] = normalizedLangClass;
          // 重新赋值回 properties，确保 HAST 树的更新
          node.properties.className = classNames;
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
  const tempHeadings: Omit<TocEntry, 'offset'>[] = [];

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
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(() => extractHeadings(tempHeadings))
    .use(normalizeCodeLanguage)
    .use(rehypePrettyCode, prettyCodeOptions);

  // 正确地分步执行解析和转换
  const mdastTree = processor.parse(content) as MdastRoot;
  const hastTree = await processor.run(mdastTree);

  // 对于 getPostBySlug，不需要精确的 offset，因为 TableOfContents 依赖 IntersectionObserver
  const headings: TocEntry[] = tempHeadings.map(h => ({ ...h, offset: 0 }));

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
 * 获取所有文章的元数据和纯文本内容。
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

    const tempHeadings: Omit<TocEntry, 'offset'>[] = [];

    // 创建一个独立的处理器实例，用于提取纯文本和标题 ID
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

    // 移除可能残余的 Markdown 强调、删除线等符号，但保留空格以保持相对偏移
    plainTextContent = plainTextContent
      .replace(/[`*~_]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // 重新计算 headings 的 offset，使其相对于 plainTextContent
    const headings: TocEntry[] = tempHeadings.map(h => {
      const offset = plainTextContent.indexOf(h.text);
      return { ...h, offset: offset !== -1 ? offset : 0 };
    });

    allSearchablePosts.push({
      metadata: {
        slug,
        ...(data as { title: string; date: string; author: string; description: string }),
      },
      plainTextContent,
      headings,
    });
  }

  return allSearchablePosts;
}
