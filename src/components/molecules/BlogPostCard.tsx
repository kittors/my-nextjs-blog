// src/components/molecules/BlogPostCard.tsx
import React from 'react';
import Link from 'next/link';
import { BlogPostMetadata } from '@/lib/posts'; // 导入文章元数据类型
import Heading from '@/components/atoms/Heading'; // 导入原子组件
import Text from '@/components/atoms/Text'; // 导入原子组件
import { type Locale } from '@/i18n-config'; // 导入 Locale 类型

// 定义 BlogPostCard 组件的 Props 类型
interface BlogPostCardProps {
  // 核心修正 1: 使用 Partial<T> 使 post 的所有属性变为可选，
  // 这样即使元数据不完整，组件也不会报错。
  post: Partial<BlogPostMetadata>;
  lang: Locale; // 核心新增：接收当前语言
  dictionary: {
    // 核心新增：接收字典
    author_label: string;
    date_label: string;
    unknown_date: string;
  };
}

/**
 * BlogPostCard 组件：用于展示单篇博客文章的摘要卡片。
 * 遵循原子设计原则，它是一个分子组件，由 Heading 和 Text 原子组件组成。
 * @param {BlogPostCardProps} props - 组件属性。
 * @param {Partial<BlogPostMetadata>} props.post - 博客文章的元数据，现在是可选的。
 * @param {Locale} props.lang - 当前语言环境。
 * @param {object} props.dictionary - 包含国际化文本的对象。
 */
const BlogPostCard: React.FC<BlogPostCardProps> = ({ post, lang, dictionary }) => {
  // 核心修正 2: 为所有可能缺失的元数据提供优雅的默认值。
  // 这确保了无论 Markdown 文件中的 frontmatter 是否完整，UI 都能保持一致和美观。
  const title = post.title || '无标题文章';
  const description = post.description || '暂无描述信息...';
  const author = post.author || '匿名作者';
  const slug = post.slug || '#'; // 如果没有 slug，链接将不跳转，避免了404错误。

  // 安全地处理日期，防止因无效日期字符串导致程序崩溃。
  const dateObj = post.date ? new Date(post.date) : null;
  // 核心修正：使用字典中的文本作为未知日期的占位符
  const displayDate =
    dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString(lang)
      : dictionary.unknown_date;

  return (
    // 核心修正：在 href 中添加语言前缀
    <Link href={`/${lang}/blog/${slug}`} className="block group">
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
          hover:bg-neutral-50
          
          /* 核心优化：将悬停样式集中到 theme.css 中 */
          blog-post-card-hover-effect
        "
      >
        {/* 文章标题 */}
        <Heading
          level={2}
          className="
            font-bold
            bg-gradient-to-r
            from-[var(--heading-gradient-from)] to-[var(--heading-gradient-to)]
            bg-clip-text text-transparent
            group-hover:from-[var(--heading-gradient-hover-from)] group-hover:to-[var(--heading-gradient-hover-to)]
            transition-all duration-300
            mb-2
          "
        >
          {title}
        </Heading>
        {/* 文章描述 */}
        <Text className="mb-3 line-clamp-2 text-[var(--blog-card-description-color)]">
          {description}
        </Text>
        {/* 作者和日期信息 */}
        <div className="flex justify-between items-center text-sm text-[var(--blog-card-meta-color)]">
          <Text as="span" className="text-sm">
            {dictionary.author_label}: {author}
          </Text>
          <Text as="span" className="text-sm">
            {dictionary.date_label}: {displayDate}
          </Text>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;
