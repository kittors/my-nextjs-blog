// src/components/molecules/BlogPostCard.tsx
import React from 'react';
import Link from 'next/link';
import { BlogPostMetadata } from '@/lib/posts'; // 导入文章元数据类型
import Heading from '@/components/atoms/Heading'; // 导入原子组件
import Text from '@/components/atoms/Text'; // 导入原子组件

// 定义 BlogPostCard 组件的 Props 类型
interface BlogPostCardProps {
  // 核心修正 1: 使用 Partial<T> 使 post 的所有属性变为可选，
  // 这样即使元数据不完整，组件也不会报错。
  post: Partial<BlogPostMetadata>;
}

/**
 * BlogPostCard 组件：用于展示单篇博客文章的摘要卡片。
 * 遵循原子设计原则，它是一个分子组件，由 Heading 和 Text 原子组件组成。
 * @param {BlogPostCardProps} props - 组件属性。
 * @param {Partial<BlogPostMetadata>} props.post - 博客文章的元数据，现在是可选的。
 */
const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  // 核心修正 2: 为所有可能缺失的元数据提供优雅的默认值。
  // 这确保了无论 Markdown 文件中的 frontmatter 是否完整，UI 都能保持一致和美观。
  const title = post.title || '无标题文章';
  const description = post.description || '暂无描述信息...';
  const author = post.author || '匿名作者';
  const slug = post.slug || '#'; // 如果没有 slug，链接将不跳转，避免了404错误。

  // 安全地处理日期，防止因无效日期字符串导致程序崩溃。
  const dateObj = post.date ? new Date(post.date) : null;
  const displayDate =
    dateObj && !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('zh-CN') : '未知日期';

  return (
    <Link href={`/blog/${slug}`} className="block group">
      <div
        className="
          bg-background
          p-6
          rounded-lg
          shadow-soft
          hover:shadow-medium
          transition-all duration-300 ease-in-out  
          border
          border-neutral-200                    
          hover:border-primary-light            
          hover:scale-[1.01]                    
          hover:bg-neutral-50                    
          dark:hover:bg-neutral-800/50
        "
      >
        {/* 文章标题 */}
        <Heading
          level={2}
          className="
            font-bold
            bg-gradient-to-r from-blue-500 to-purple-600 
            dark:from-blue-400 dark:to-purple-500
            bg-clip-text text-transparent
            group-hover:from-blue-600 group-hover:to-purple-700
            dark:group-hover:from-blue-500 dark:group-hover:to-purple-600
            transition-all duration-300
            mb-2
          "
        >
          {title}
        </Heading>
        {/* 文章描述 */}
        <Text className="text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
          {description}
        </Text>
        {/* 作者和日期信息 */}
        <div className="flex justify-between items-center text-sm text-neutral-500 dark:text-neutral-500">
          <Text as="span" className="text-sm">
            作者: {author}
          </Text>
          <Text as="span" className="text-sm">
            日期: {displayDate}
          </Text>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;
