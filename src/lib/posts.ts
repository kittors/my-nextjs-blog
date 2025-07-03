import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// 移除 MDXRemoteSerializeResult 和 rehype 插件的导入
// import type { MDXRemoteSerializeResult } from 'next-mdx-remote';
// import rehypeSlug from 'rehype-slug';
// import rehypeAutolinkHeadings from 'rehype-autolink-headings';
// import rehypePrismPlus from 'rehype-prism-plus';

// 定义博客文章元数据的接口
export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  // 可以根据需要添加更多字段
}

// 定义完整的博客文章接口
export interface BlogPost extends BlogPostMetadata {
  contentHtml: string; // 恢复为 contentHtml
}

// 定义 Markdown 文件所在的目录
const postsDirectory = path.join(process.cwd(), 'posts');

/**
 * 获取所有博客文章的元数据（不包含详细内容）。
 * ...
 */
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
  return allPostsMetadata.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * 根据文章的 slug 获取单篇博客文章的完整内容。
 * @param {string} slug - 文章的唯一标识符（slug）。
 * @returns {Promise<BlogPost>} 包含文章元数据和原始 HTML 内容。
 */
export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  // 关键：只使用 remark 和 remark-html
  const processedContent = await remark()
    .use(html, { sanitize: false })
    .process(content);

  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml, // 恢复为 contentHtml
    ...(data as { title: string; date: string; author: string; description: string }),
  };
}

/**
 * 获取所有博客文章的 slug。
 * ...
 */
export function getAllPostSlugs(): { slug: string }[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ''),
    };
  });
}