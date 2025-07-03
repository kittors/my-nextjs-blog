// src/components/molecules/ImagePreview.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize } from 'lucide-react';

interface ImagePreviewProps {
  src: string | null;
  onClose: () => void;
}

/**
 * ImagePreview 组件：一个分子级别的 UI 组件。
 * 它提供一个模态框来预览图片，并包含缩放、旋转和还原的交互功能。
 * 它的可见性由父组件通过 src prop 控制。
 * @param {ImagePreviewProps} props - 组件属性。
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  // 使用 ref 来存储 DOM 元素，以便附加事件监听器
  const imageContentElementRef = useRef<HTMLDivElement | null>(null);

  // 节流控制相关的 ref
  const lastZoomTimeRef = useRef(0);
  const ZOOM_THROTTLE_DELAY = 100; // 缩放节流延迟，单位毫秒

  // 处理图片放大
  const handleZoomIn = useCallback(() => {
    setScale(s => Math.min(s + 0.5, 5)); // 调整为更大的固定步长 0.5
  }, []);

  // 处理图片缩小
  const handleZoomOut = useCallback(() => {
    setScale(s => Math.max(s - 0.5, 0.2)); // 调整为更大的固定步长 0.5
  }, []);

  // 定义 wheel 事件处理函数，使用 useCallback 确保其引用稳定
  const handleWheelEvent = useCallback(
    (e: WheelEvent) => {
      e.preventDefault(); // 阻止默认的页面滚动行为

      const now = Date.now();
      // 领先边缘节流：如果在节流期内，则忽略事件
      if (now - lastZoomTimeRef.current < ZOOM_THROTTLE_DELAY) {
        return;
      }

      // 执行缩放操作
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
      lastZoomTimeRef.current = now; // 更新最后一次执行时间
    },
    [handleZoomIn, handleZoomOut]
  ); // 依赖缩放处理函数

  // 回调 Ref：用于在 DOM 元素挂载/卸载时附加/移除事件监听器
  const setContentRef = useCallback(
    (node: HTMLDivElement | null) => {
      // 如果之前存在 DOM 元素，则先移除旧的事件监听器
      if (imageContentElementRef.current) {
        imageContentElementRef.current.removeEventListener('wheel', handleWheelEvent);
      }

      // 将新的 DOM 节点赋值给 ref
      imageContentElementRef.current = node;

      // 如果新的 DOM 节点存在，则附加新的事件监听器
      if (node) {
        node.addEventListener('wheel', handleWheelEvent, { passive: false }); // 设置 passive 为 false
      }
    },
    [handleWheelEvent]
  ); // 依赖 handleWheelEvent

  // 当新的图片源被设置时，重置缩放和旋转状态。
  useEffect(() => {
    setScale(1);
    setRotation(0);
  }, [src]);

  // 控制页面滚动的 effect：当预览打开时，禁用页面滚动。
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

  // 处理键盘事件的 effect：监听 Escape 键关闭预览。
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // 处理图片向右旋转
  const handleRotateRight = useCallback(() => {
    setRotation(r => r + 90);
  }, []);

  // 处理图片向左旋转
  const handleRotateLeft = useCallback(() => {
    setRotation(r => r - 90);
  }, []);

  // 处理还原到默认尺寸和旋转
  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
  }, []);

  // 如果没有图片源，则不渲染组件
  if (!src) {
    return null;
  }

  return (
    <div className="image-preview-backdrop" onClick={onClose}>
      {/* 将回调 ref 附加到图片内容区域的 div 上 */}
      <div className="image-preview-content" onClick={e => e.stopPropagation()} ref={setContentRef}>
        <img
          src={src}
          alt="预览图片"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-out', // 添加过渡效果，使缩放和旋转平滑
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
        <button onClick={handleReset} aria-label="还原">
          <Maximize />
        </button>
        <button onClick={onClose} aria-label="关闭">
          <X />
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
