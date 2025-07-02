import React from 'react';
import { BlogPostMetadata } from '@/lib/posts'; // 导入数据获取函数和类型
import BlogPostCard from '@/components/molecules/BlogPostCard'; // 导入分子组件
import Heading from '@/components/atoms/Heading'; // 导入原子组件
import Text from '@/components/atoms/Text'; // 导入原子组件

// 定义 BlogList 组件的 Props 类型
interface BlogListProps {
  posts: BlogPostMetadata[]; // 接收博客文章元数据列表
}

/**
 * BlogList 组件：用于展示所有博客文章的列表。
 * 遵循原子设计原则，它是一个组织组件，由 BlogPostCard 分子组件组成。
 * @param {BlogListProps} props - 组件属性。
 * @param {BlogPostMetadata[]} props.posts - 博客文章元数据数组。
 */
const BlogList: React.FC<BlogListProps> = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10">
        <Text className="text-xl text-neutral-500">暂无博客文章。</Text> {/* 修正：使用 text-neutral-500 */}
      </div>
    );
  }

  return (
    <section className="py-8">
      <Heading level={1} className="text-center mb-10 text-neutral-800"> {/* 修正：使用 text-neutral-800 */}
        最新博客文章
      </Heading>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogPostCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  );
};

export default BlogList;