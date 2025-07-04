// src/components/atoms/PostImage.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface PostImageProps {
  src: string;
  alt: string;
  onClick: (src: string) => void;
}

/**
 * 创建一个 SVG 闪烁效果作为占位符。
 * @param {number} w - 宽度
 * @param {number} h - 高度
 * @returns {string} SVG 字符串
 */
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1.2s" repeatCount="indefinite"  />
</svg>`;

/**
 * 将字符串转换为 Base64。
 * @param {string} str - 输入字符串
 * @returns {string} Base64 编码的字符串
 */
const toBase64 = (str: string) =>
  typeof window === 'undefined' ? Buffer.from(str).toString('base64') : window.btoa(str);

/**
 * PostImage 组件：一个原子级别的 UI 组件，用于显示博客文章中的图片。
 * 核心修正：
 * 1. 实现了基于 SVG 的微光闪烁（shimmer）占位符，取代了默认的灰色方块，提升了加载过程中的视觉体验。
 * 2. 使用 `useState` 跟踪图片的加载状态 (`isLoading`)。
 * 3. 在图片加载时，应用模糊和灰度效果；加载完成后，通过平滑的 CSS 过渡移除这些效果。
 * 4. 这种方法彻底解决了图片加载完成时出现的闪烁问题，并提供了一个优雅的加载动画。
 * @param {PostImageProps} props - 组件属性。
 */
const PostImage: React.FC<PostImageProps> = ({ src, alt, onClick }) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <span className="post-image-container">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={450}
        sizes="(max-width: 768px) 100vw, 800px"
        loading="lazy"
        placeholder="blur"
        blurDataURL={`data:image/svg+xml;base64,${toBase64(shimmer(800, 450))}`}
        className={`
          post-image
          transition-all duration-700 ease-in-out
          ${isLoading ? 'grayscale blur-md scale-105' : 'grayscale-0 blur-0 scale-100'}
        `}
        onLoadingComplete={() => setIsLoading(false)}
        onClick={() => onClick(src)}
      />
    </span>
  );
};

export default PostImage;
