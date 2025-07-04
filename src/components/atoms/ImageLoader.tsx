// src/components/atoms/ImageLoader.tsx
import React from 'react';

/**
 * ImageLoader 组件：一个纯粹的、用于显示加载状态的原子组件。
 *
 * 核心修正（最终版）：
 * 将内部所有的 <div> 元素彻底替换为 <span>，以确保此组件
 * 在任何情况下（包括被渲染在 <p> 标签内）都符合 HTML 规范，
 * 从根源上解决 "div cannot be a descendant of p" 的水合作用错误。
 */
const ImageLoader: React.FC = () => {
  return (
    <span className="image-loader-container">
      {/* 核心修正：从 <div> 改为 <span> */}
      <span className="pulsing-dots">
        {/* 核心修正：从 <div> 改为 <span> */}
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </span>
    </span>
  );
};

export default ImageLoader;
