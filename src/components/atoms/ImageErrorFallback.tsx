// src/components/atoms/ImageErrorFallback.tsx
import React from 'react';
import { ImageOff } from 'lucide-react';

/**
 * ImageErrorFallback 组件：一个用于显示图片加载失败状态的原子组件。
 *
 * 核心修正（最终版）：
 * 将内部的 <p> 元素修改为 <span>，以防止当此组件被渲染在
 * 另一个 <p> 标签内时，出现不合法的 HTML 嵌套，从而避免潜在的水合作用错误。
 */
const ImageErrorFallback: React.FC = () => {
  return (
    <span className="image-error-fallback-container">
      <ImageOff className="fallback-icon" size={48} />
      {/* 核心修正：从 <p> 改为 <span> */}
      <span className="fallback-text">图片加载失败</span>
    </span>
  );
};

export default ImageErrorFallback;
