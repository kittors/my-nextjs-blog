// src/components/molecules/ImagePreview.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, RotateCcw } from 'lucide-react';

interface ImagePreviewProps {
  src: string | null;
  onClose: () => void;
}

/**
 * ImagePreview 组件：一个分子级别的 UI 组件。
 * 它提供一个模态框来预览图片，并包含缩放和旋转的交互功能。
 * 它的可见性由父组件通过 src prop 控制。
 * @param {ImagePreviewProps} props - 组件属性。
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 核心修正：当一个新的图片源被设置时，重置缩放和旋转状态。
  // 这确保了每次打开预览时，图片都从默认的、未经变换的状态开始。
  useEffect(() => {
    setScale(1);
    setRotation(0);
  }, [src]);

  // 控制页面滚动的 effect 保持不变
  useEffect(() => {
    if (src) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [src]);

  // 处理键盘事件的 effect 保持不变
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  const handleZoomIn = () => setScale(s => s * 1.2);
  const handleZoomOut = () => setScale(s => s / 1.2);
  const handleRotateRight = () => setRotation(r => r + 90);
  const handleRotateLeft = () => setRotation(r => r - 90);

  return (
    <div className="image-preview-backdrop" onClick={onClose}>
      <div className="image-preview-content" onClick={e => e.stopPropagation()}>
        {/* 优化点：移除了 onLoad 事件和相关的 JavaScript 计算。
          现在，图片的初始尺寸完全由 CSS 控制。
          .image-preview-content 提供了最大可用空间 (90vw, 80vh)。
          <img> 标签的 CSS (max-width: 100%, max-height: 100%, object-fit: contain) 
          会自动将图片等比缩放到恰好能完整显示在容器内。
          这确保了所有图片，无论原始尺寸多大，初始预览时都具有一致的、完整的视觉效果。
        */}
        <img
          src={src}
          alt="预览图片"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-out',
          }}
        />
      </div>
      <div className="image-preview-toolbar" onClick={e => e.stopPropagation()}>
        <button onClick={handleZoomIn} aria-label="放大">
          <ZoomIn />
        </button>
        <button onClick={handleZoomOut} aria-label="缩小">
          <ZoomOut />
        </button>
        <button onClick={handleRotateLeft} aria-label="向左旋转">
          <RotateCcw />
        </button>
        <button onClick={handleRotateRight} aria-label="向右旋转">
          <RotateCw />
        </button>
        <button onClick={onClose} aria-label="关闭">
          <X />
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
