// src/components/atoms/PostImage.tsx
"use client";

import React from 'react';
import Image from 'next/image';

interface PostImageProps {
  src: string;
  alt: string;
  onClick: (src: string) => void;
}

/**
 * PostImage 组件：一个原子级别的 UI 组件。
 * 它封装了 Next.js 的 Image 组件，专门用于博客文章内容中。
 * 实现了懒加载、圆角样式，并提供了点击事件处理。
 * @param {PostImageProps} props - 组件属性。
 */
const PostImage: React.FC<PostImageProps> = ({ src, alt, onClick }) => {
  return (
    <div className="post-image-container">
      <Image
        src={src}
        alt={alt}
        width={800} // 提供一个默认的基础宽度
        height={450} // 提供一个默认的基础高度
        sizes="(max-width: 768px) 100vw, 800px" // 响应式尺寸
        loading="lazy" // 启用原生懒加载
        className="post-image"
        onClick={() => onClick(src)}
      />
    </div>
  );
};

export default PostImage;
