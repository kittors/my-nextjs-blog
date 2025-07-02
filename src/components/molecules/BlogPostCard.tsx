import React from 'react';
import Link from 'next/link';
import { BlogPostMetadata } from '@/lib/posts'; // 导入文章元数据类型
import Heading from '@/components/atoms/Heading'; // 导入原子组件
import Text from '@/components/atoms/Text'; // 导入原子组件

// 定义 BlogPostCard 组件的 Props 类型
interface BlogPostCardProps {
  post: BlogPostMetadata; // 接收一篇文章的元数据
}

/**
 * BlogPostCard 组件：用于展示单篇博客文章的摘要卡片。
 * 遵循原子设计原则，它是一个分子组件，由 Heading 和 Text 原子组件组成。
 * @param {BlogPostCardProps} props - 组件属性。
 * @param {BlogPostMetadata} props.post - 博客文章的元数据。
 */
const BlogPostCard: React.FC<BlogPostCardProps> = ({ post }) => {
  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <div className="bg-background p-6 rounded-lg shadow-soft hover:shadow-medium transition-shadow duration-300 border border-neutral-100 hover:border-primary-light"> {/* 修正：bg-background，并添加边框样式 */}
        {/* 文章标题 */}
        <Heading level={2} className="text-primary hover:text-primary-dark mb-2"> {/* 修正：text-primary 和 hover:text-primary-dark */}
          {post.title}
        </Heading>
        {/* 文章描述 */}
        <Text className="text-neutral-600 mb-3 line-clamp-2"> {/* 修正：text-neutral-600 */}
          {post.description}
        </Text>
        {/* 作者和日期信息 */}
        <div className="flex justify-between items-center text-sm text-neutral-500"> {/* 修正：text-neutral-500 */}
          <Text as="span" className="text-sm">
            作者: {post.author}
          </Text>
          <Text as="span" className="text-sm">
            日期: {new Date(post.date).toLocaleDateString('zh-CN')}
          </Text>
        </div>
      </div>
    </Link>
  );
};

export default BlogPostCard;