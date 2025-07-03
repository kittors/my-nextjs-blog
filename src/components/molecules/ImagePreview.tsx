// src/components/molecules/ImagePreview.tsx
"use client";

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

  // 当预览的图片源变化时，重置缩放和旋转状态
  useEffect(() => {
    setScale(1);
    setRotation(0);
  }, [src]);

  // 处理键盘事件，例如按 Esc 键关闭预览
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
      <div className="image-preview-content" onClick={(e) => e.stopPropagation()}>
        <img
          src={src}
          alt="预览图片"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-out',
          }}
        />
      </div>
      <div className="image-preview-toolbar">
        <button onClick={handleZoomIn} aria-label="放大"><ZoomIn /></button>
        <button onClick={handleZoomOut} aria-label="缩小"><ZoomOut /></button>
        <button onClick={handleRotateLeft} aria-label="向左旋转"><RotateCcw /></button>
        <button onClick={handleRotateRight} aria-label="向右旋转"><RotateCw /></button>
        <button onClick={onClose} aria-label="关闭"><X /></button>
      </div>
    </div>
  );
};

export default ImagePreview;
