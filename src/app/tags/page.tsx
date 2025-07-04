// src/app/tags/page.tsx
import React from 'react';
import { getSortedPostsMetadata, getAllTags } from '@/lib/posts';
import TagsPageClient from '@/components/templates/TagsPageClient'; // 核心修正：导入新的客户端组件

/**
 * TagsPage (Server Component): 标签分类页面的服务器端入口。
 *
 * 这个组件在服务器上运行，负责在构建时或请求时获取所有必要的数据，
 * 包括所有文章的元数据和所有标签的信息。
 * 然后，它将这些预取的数据作为 props 传递给客户端组件 `TagsPageClient` 进行渲染。
 * 这种分离确保了文件系统操作被严格限制在服务器端，而交互逻辑则在客户端高效执行。
 */
export default async function TagsPage() {
  // 在服务器端安全地获取数据
  const allPosts = getSortedPostsMetadata();
  const allTags = getAllTags();

  // 将获取到的数据作为 props 传递给客户端组件进行渲染
  return <TagsPageClient allPosts={allPosts} allTags={allTags} />;
}
