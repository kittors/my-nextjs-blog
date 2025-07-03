import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypePrettyCode, { type Options as RehypePrettyCodeOptions } from 'rehype-pretty-code';
import rehypeStringify from 'rehype-stringify';
import { Element } from 'hast';

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

  // 核心修正：简化配置以进行调试。
  // 我们将暂时使用一个单一、稳定的主题来确认 Shiki 的核心高亮功能是否正常工作。
  const prettyCodeOptions: Partial<RehypePrettyCodeOptions> = {
    theme: 'github-dark', // 使用一个最常见的主题进行测试
    keepBackground: true, // 确保主题自带的背景色能够被应用
    onVisitLine(node: Element) {
      // 防止空行在 `display: grid` 模式下被折叠
      if (node.children.length === 0) {
        node.children = [{ type: 'text', value: ' ' }];
      }
    },
  };

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
