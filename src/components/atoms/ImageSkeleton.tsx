// src/components/atoms/ImageSkeleton.tsx
import React from 'react';

interface ImageSkeletonProps {
  isLoaded: boolean;
}

/**
 * ImageSkeleton 组件：一个用于表示图片加载状态的骨架屏。
 * 它现在是一个纯粹的视觉覆盖层，其可见性由 isLoaded 属性和 CSS 控制。
 */
const ImageSkeleton: React.FC<ImageSkeletonProps> = ({ isLoaded }) => {
  return (
    <span
      className={`image-skeleton skeleton-pulse ${isLoaded ? 'loaded' : ''}`}
      aria-label="图片加载中"
    ></span>
  );
};

export default ImageSkeleton;
