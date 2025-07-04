// src/components/atoms/PostImage.tsx
'use client';

import React, { useState, useEffect, memo } from 'react';
import Image from 'next/image';
import ImageLoader from './ImageLoader';
import ImageErrorFallback from './ImageErrorFallback';

interface PostImageProps {
  src: string;
  alt: string;
  onClick: (src: string) => void;
}

type ImageStatus = 'loading' | 'loaded' | 'error';

/**
 * PostImage 组件：一个健壮的、负责图片加载全流程的原子组件。
 *
 * 核心优化：实现图片的原始宽高比展示。
 *
 * 实现原理：
 * 1.  移除硬编码的 width 和 height 属性，改用 `fill` 属性让图片填充其父容器。
 * 2.  在 `onLoad` 事件中，通过 `event.currentTarget` 获取图片的 `naturalWidth` 和 `naturalHeight`。
 * 3.  根据真实尺寸计算出图片的宽高比，并将其存储在组件的 state 中。
 * 4.  将这个动态计算出的 `aspectRatio` 应用于父容器 `<span>` 的内联样式。
 * 5.  这样，容器会首先根据图片的真实比例调整好自身尺寸，然后 `next/image` 再填充这个容器，从而完美地实现原始比例展示。
 * 6.  在加载期间，为容器设置一个 `min-height`，以确保加载动画能正常显示。
 *
 * @param {PostImageProps} props - 组件属性。
 */
const PostImage: React.FC<PostImageProps> = ({ src, alt, onClick }) => {
  const [status, setStatus] = useState<ImageStatus>('loading');
  const [showSkeletonAndLoader, setShowSkeletonAndLoader] = useState(false);
  // 新增 state，用于存储动态计算出的图片宽高比
  const [aspectRatio, setAspectRatio] = useState<string | undefined>(undefined);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (status === 'loading') {
        setShowSkeletonAndLoader(true);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [status]);

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    // 图片加载完成后，计算并设置其真实的宽高比
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setAspectRatio(`${naturalWidth} / ${naturalHeight}`);
    }
    setStatus('loaded');
    setShowSkeletonAndLoader(false);
  };

  const handleError = () => {
    setStatus('error');
    setShowSkeletonAndLoader(false);
  };

  return (
    <span
      className="post-image-wrapper"
      style={{
        // 动态应用计算出的宽高比
        aspectRatio: aspectRatio,
        backgroundColor: showSkeletonAndLoader ? undefined : 'transparent',
        // 在加载期间（即宽高比未知时）提供一个最小高度，以确保加载动画可见
        minHeight: showSkeletonAndLoader ? '200px' : undefined,
      }}
    >
      {showSkeletonAndLoader && <ImageLoader />}
      {status === 'error' && <ImageErrorFallback />}

      <Image
        src={src}
        alt={alt}
        // 核心修正：使用 `fill` 属性，让图片填充父容器
        fill
        sizes="(max-width: 768px) 100vw, 800px"
        onLoad={handleLoad}
        onError={handleError}
        onClick={() => status === 'loaded' && onClick(src)}
        className={`
          post-image-content
          transition-opacity duration-500
          ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </span>
  );
};

export default memo(PostImage);
