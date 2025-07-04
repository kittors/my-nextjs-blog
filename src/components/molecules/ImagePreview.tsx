// src/components/molecules/ImagePreview.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize, Download } from 'lucide-react'; // 核心修正：导入 Download 图标
import { useToast } from '@/contexts/ToastContext'; // 核心修正：导入 Toast hook

interface ImagePreviewProps {
  src: string | null;
  onClose: () => void;
}

/**
 * ImagePreview 组件：一个分子级别的 UI 组件。
 * 它提供一个模态框来预览图片，并包含缩放、旋转、还原和下载的交互功能。
 * @param {ImagePreviewProps} props - 组件属性。
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { showToast } = useToast(); // 核心修正：获取 showToast 函数

  const imageContentElementRef = useRef<HTMLDivElement | null>(null);
  const lastZoomTimeRef = useRef(0);
  const ZOOM_THROTTLE_DELAY = 100;

  const handleZoomIn = useCallback(() => {
    setScale(s => Math.min(s + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale(s => Math.max(s - 0.5, 0.2));
  }, []);

  const handleWheelEvent = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - lastZoomTimeRef.current < ZOOM_THROTTLE_DELAY) {
        return;
      }
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
      lastZoomTimeRef.current = now;
    },
    [handleZoomIn, handleZoomOut]
  );

  const setContentRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (imageContentElementRef.current) {
        imageContentElementRef.current.removeEventListener('wheel', handleWheelEvent);
      }
      imageContentElementRef.current = node;
      if (node) {
        node.addEventListener('wheel', handleWheelEvent, { passive: false });
      }
    },
    [handleWheelEvent]
  );

  useEffect(() => {
    setScale(1);
    setRotation(0);
  }, [src]);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleRotateRight = useCallback(() => {
    setRotation(r => r + 90);
  }, []);

  const handleRotateLeft = useCallback(() => {
    setRotation(r => r - 90);
  }, []);

  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
  }, []);

  /**
   * 核心修正：处理图片下载的函数。
   * 由于图片源是跨域的，我们不能直接使用 `<a>` 标签的 `download` 属性。
   * 解决方案是：
   * 1. 使用 `fetch` 获取图片数据。
   * 2. 将响应体转换为 `Blob` 对象。
   * 3. 使用 `URL.createObjectURL` 创建一个临时的本地 URL。
   * 4. 创建一个隐藏的 `<a>` 标签，设置其 `href` 和 `download` 属性。
   * 5. 编程式地点击该链接来触发下载。
   * 6. 下载完成后，使用 `URL.revokeObjectURL` 释放内存。
   */
  const handleDownload = async () => {
    if (!src) return;

    showToast('正在准备下载...', 'default', 2000);
    try {
      const response = await fetch(src);
      if (!response.ok) {
        throw new Error(`网络响应错误: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // 从 URL 中提取一个合理的文件名
      const filename = src.split('/').pop()?.split('?')[0] || 'downloaded-image.jpg';
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // 释放内存
      showToast('下载已开始！', 'success');
    } catch (error) {
      console.error('下载图片失败:', error);
      showToast('下载失败，请稍后重试。', 'error');
    }
  };

  if (!src) {
    return null;
  }

  return (
    <div className="image-preview-backdrop" onClick={onClose}>
      <div className="image-preview-content" onClick={e => e.stopPropagation()} ref={setContentRef}>
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
        <button onClick={handleZoomIn} aria-label="放大" title="放大">
          <ZoomIn />
        </button>
        <button onClick={handleZoomOut} aria-label="缩小" title="缩小">
          <ZoomOut />
        </button>
        <button onClick={handleRotateLeft} aria-label="向左旋转" title="向左旋转">
          <RotateCcw />
        </button>
        <button onClick={handleRotateRight} aria-label="向右旋转" title="向右旋转">
          <RotateCw />
        </button>
        <button onClick={handleReset} aria-label="还原" title="还原">
          <Maximize />
        </button>
        {/* 核心修正：添加下载按钮 */}
        <button onClick={handleDownload} aria-label="下载图片" title="下载图片">
          <Download />
        </button>
        <button onClick={onClose} aria-label="关闭" title="关闭">
          <X />
        </button>
      </div>
    </div>
  );
};

export default ImagePreview;
