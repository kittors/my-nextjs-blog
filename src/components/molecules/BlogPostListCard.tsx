// src/components/molecules/BlogPostListCard.tsx
import React from 'react';
import Link from 'next/link';
import { type BlogPostMetadata } from '@/lib/posts';
import { Calendar, User, Tag } from 'lucide-react';
import Heading from '@/components/atoms/Heading'; // 核心修正：导入 Heading 原子组件
// 核心修正：从 src/lib/config 导入 Locale 类型
import { type Locale } from '@/lib/config';

interface BlogPostListCardProps {
  post: BlogPostMetadata;
  lang: Locale; // 核心新增：接收当前语言
}

/**
 * BlogPostListCard 组件：一个专为列表视图设计的分子组件。
 *
 * 核心修正：
 * 1. 移除了硬编码的 <h2> 元素。
 * 2. 复用了可维护的 `Heading` 原子组件来渲染标题，确保其样式
 * (字体大小、粗细、渐变色等) 与首页的 `BlogPostCard` 完全一致。
 * 3. 这种重构遵循了原子设计的核心原则，提升了代码的可维护性和视觉一致性。
 * 4. 新增 `lang` prop，用于在生成链接时包含语言前缀。
 *
 * @param {BlogPostListCardProps} props - 组件属性。
 * @param {Locale} props.lang - 当前语言环境。
 */
const BlogPostListCard: React.FC<BlogPostListCardProps> = ({ post, lang }) => {
  const { slug, title, date, author, description, tags = [] } = post;
  // 核心修正：使用 lang 格式化日期
  const displayDate = new Date(date).toLocaleDateString(lang, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    // 核心修正：在 href 中添加语言前缀
    <Link href={`/${lang}/blog/${slug}`} className="blog-post-list-card-link group">
      <article className="blog-post-list-card">
        <div className="card-content">
          {/* 使用可复用的 Heading 组件，并传入与 BlogPostCard 完全一致的 className */}
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
          <p className="card-description">{description}</p>
          <div className="card-metadata">
            <div className="meta-item">
              <User size={14} />
              <span>{author}</span>
            </div>
            <div className="meta-item">
              <Calendar size={14} />
              <span>{displayDate}</span>
            </div>
          </div>
          {tags.length > 0 && (
            <div className="card-tags">
              <Tag size={14} className="tags-icon" />
              <div className="tags-list">
                {tags.map(tag => (
                  <span key={tag} className="tag-pill">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
};

export default BlogPostListCard;
