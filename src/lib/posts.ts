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
import { toString } from 'hast-util-to-string'; // 导入 hast-util-to-string 用于提取纯文本
import remarkGfm from 'remark-gfm'; // 导入 remark-gfm
import remarkMath from 'remark-math'; // 核心修正：导入 remark-math
import rehypeKatex from 'rehype-katex'; // 核心修正：导入 rehype-katex

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
 * 新增 rehype 插件：标准化代码块的语言类名。
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
    .use(remarkGfm)
    .use(remarkMath) // 核心修正：添加 remark-math 插件
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeKatex) // 核心修正：添加 rehype-katex 插件
    .use(() => extractHeadings(headings))
    .use(normalizeCodeLanguage)
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

    // 核心修正：在提取纯文本之前，先移除 Markdown 语法
    // 使用 remark-parse 和 remark-stringify 来将 Markdown 转换为纯文本
    // 然后再用正则表达式去除剩余的 Markdown 链接、图片等语法
    const markdownToPlainText = unified()
      .use(remarkParse) // 解析 Markdown
      .use(remarkGfm) // 添加 remark-gfm 插件以支持 GFM 语法
      .use(remarkMath) // 核心修正：添加 remark-math 插件
      .use(() => (tree: MdastRoot) => {
        // 遍历 AST，移除不必要的节点，例如链接和图片
        visit(
          tree,
          ['link', 'image', 'inlineCode', 'strong', 'emphasis', 'math', 'inlineMath'], // 核心修正：添加 'math' 和 'inlineMath' 节点类型
          (node, index, parent) => {
            if (!parent || index === undefined) {
              return; // 安全检查，尽管这些类型的父节点通常应该存在
            }

            if (node.type === 'inlineCode') {
              parent.children.splice(index, 1, { type: 'text', value: node.value as string });
              return SKIP;
            } else if (node.type === 'strong' || node.type === 'emphasis') {
              const childrenToSplice = Array.isArray(node.children) ? node.children : [];
              parent.children.splice(index, 1, ...childrenToSplice);
              return SKIP;
            } else if (node.type === 'link' || node.type === 'image') {
              parent.children.splice(index, 1);
              return SKIP;
            } else if (node.type === 'math' || node.type === 'inlineMath') {
              // 核心修正：处理数学公式节点
              // 对于数学公式，将其内容转换为纯文本，或者直接移除，取决于搜索需求
              // 暂时将其内容作为纯文本保留，以便搜索到公式中的关键词（如果适用）
              parent.children.splice(index, 1, { type: 'text', value: node.value as string });
              return SKIP;
            }
          }
        );
      })
      .use(remarkRehype) // 转换为 HAST
      .use(() => (tree: HastRoot) => {
        // 在 HAST 阶段，可以进一步清理，例如移除 HTML 标签
        // 这里我们主要依赖 toString 来处理，但为了更彻底，可以添加更多清理逻辑
      });

    const mdastTree = markdownToPlainText.parse(content) as MdastRoot;
    const hastTree = (await markdownToPlainText.run(mdastTree)) as HastRoot;
    let plainTextContent = toString(hastTree);

    // 进一步清理，移除可能残余的 Markdown 语法或多余的空格
    plainTextContent = plainTextContent
      .replace(/[`*~_]/g, '') // 移除 Markdown 强调、删除线、下划线等符号
      .replace(/\s+/g, ' ') // 将多个连续的空格替换为单个空格
      .trim(); // 移除首尾空格

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
