import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// 定义博客文章元数据的类型
export interface BlogPostMetadata {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  // 可以根据需要添加更多字段
}

// 定义完整的博客文章类型，包含元数据和 HTML 内容
export interface BlogPost extends BlogPostMetadata {
  contentHtml: string;
}

const postsDirectory = path.join(process.cwd(), 'posts');

/**
 * 获取所有博客文章的元数据（不包含内容）。
 * 用于生成博客列表。
 * @returns {BlogPostMetadata[]} 包含所有文章元数据的数组。
 */
export function getSortedPostsMetadata(): BlogPostMetadata[] {
  // 获取 /posts 目录下所有文件名
  const fileNames = fs.readdirSync(postsDirectory);

  const allPostsMetadata = fileNames.map((fileName) => {
    // 移除 ".md" 后缀以获取 slug
    const slug = fileName.replace(/\.md$/, '');

    // 读取 markdown 文件内容
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // 使用 gray-matter 解析 front matter
    const matterResult = matter(fileContents);

    // 返回数据，并确保类型匹配
    return {
      slug,
      ...(matterResult.data as { title: string; date: string; author: string; description: string }),
    };
  });

  // 根据日期对文章进行排序
  return allPostsMetadata.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

/**
 * 根据 slug 获取单篇博客文章的完整内容（包含元数据和 HTML 内容）。
 * 用于生成博客详情页。
 * @param {string} slug 文章的 slug。
 * @returns {Promise<BlogPost>} 包含文章元数据和 HTML 内容的对象。
 */
export async function getPostBySlug(slug: string): Promise<BlogPost> {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // 使用 gray-matter 解析 front matter
  const matterResult = matter(fileContents);

  // 使用 remark 将 markdown 转换为 HTML 字符串
  const processedContent = await remark().use(html).process(matterResult.content);
  const contentHtml = processedContent.toString();

  // 返回数据，并确保类型匹配
  return {
    slug,
    contentHtml,
    ...(matterResult.data as { title: string; date: string; author: string; description: string }),
  };
}

/**
 * 获取所有博客文章的 slug。
 * 用于 Next.js 的 `generateStaticParams` 函数，以生成所有静态路径。
 * @returns {{ slug: string }[]} 包含所有文章 slug 的数组。
 */
export function getAllPostSlugs(): { slug: string }[] {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => {
    return {
      slug: fileName.replace(/\.md$/, ''),
    };
  });
}