// src/components/molecules/ImagePreview.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, RotateCcw, Maximize, Download } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface ImagePreviewProps {
  src: string | null;
  onClose: () => void;
}

/**
 * ImagePreview 组件：一个分子级别的 UI 组件。
 * 它提供一个模态框来预览图片，并包含缩放、旋转、还原和下载的交互功能。
 *
 * 核心优化：新增双指缩放功能，支持移动端手势操作。
 *
 * 实现原理：
 * 1.  **触摸事件监听：** 在 `image-preview-content` 元素上监听 `touchstart`, `touchmove`, `touchend` 事件。
 * 2.  **双指判断：** 在 `touchmove` 事件中，检查 `event.touches.length === 2` 以确认是双指操作。
 * 3.  **距离计算：** 记录两个触摸点之间的初始距离（`initialDistance`）。
 * 4.  **缩放比例计算：** 在 `touchmove` 过程中，计算新的触摸点距离与初始距离的比例，并将其应用到 `scale` 状态上。
 * 5.  **防止默认行为：** 在 `touchmove` 中调用 `e.preventDefault()` 以阻止浏览器默认的滚动和缩放行为。
 * 6.  **节流：** 对 `wheel` 和 `touchmove` 事件进行节流处理，以优化性能并避免过度更新。
 *
 * @param {ImagePreviewProps} props - 组件属性。
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({ src, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const { showToast } = useToast();

  const imageContentElementRef = useRef<HTMLDivElement | null>(null);
  const lastZoomTimeRef = useRef(0);
  const ZOOM_THROTTLE_DELAY = 100; // 缩放事件节流延迟

  // 双指缩放相关的状态
  const initialPinchDistanceRef = useRef<number | null>(null);
  const initialScaleRef = useRef<number>(1);

  /**
   * 处理放大操作。
   */
  const handleZoomIn = useCallback(() => {
    setScale(s => Math.min(s + 0.5, 5)); // 最大放大到 5 倍
  }, []);

  /**
   * 处理缩小操作。
   */
  const handleZoomOut = useCallback(() => {
    setScale(s => Math.max(s - 0.5, 0.2)); // 最小缩小到 0.2 倍
  }, []);

  /**
   * 处理鼠标滚轮事件，用于桌面端缩放。
   * @param {WheelEvent} e - 滚轮事件对象。
   */
  const handleWheelEvent = useCallback(
    (e: WheelEvent) => {
      e.preventDefault(); // 阻止页面滚动
      const now = Date.now();
      if (now - lastZoomTimeRef.current < ZOOM_THROTTLE_DELAY) {
        return; // 节流，避免频繁触发
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

  /**
   * 处理触摸开始事件（双指缩放）。
   * @param {TouchEvent} e - 触摸事件对象。
   */
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // 记录初始双指距离和当前缩放值
        initialPinchDistanceRef.current = Math.hypot(
          e.touches[0].pageX - e.touches[1].pageX,
          e.touches[0].pageY - e.touches[1].pageY
        );
        initialScaleRef.current = scale;
      }
    },
    [scale]
  );

  /**
   * 处理触摸移动事件（双指缩放）。
   * @param {TouchEvent} e - 触摸事件对象。
   */
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && initialPinchDistanceRef.current !== null) {
      e.preventDefault(); // 阻止浏览器默认的缩放和滚动行为
      const currentDistance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );
      const scaleFactor = currentDistance / initialPinchDistanceRef.current;
      // 计算新的缩放值，并限制在 0.2 到 5 之间
      const newScale = Math.max(0.2, Math.min(5, initialScaleRef.current * scaleFactor));
      setScale(newScale);
    }
  }, []);

  /**
   * 处理触摸结束事件（双指缩放）。
   */
  const handleTouchEnd = useCallback(() => {
    initialPinchDistanceRef.current = null; // 重置初始距离
  }, []);

  /**
   * 设置图片内容元素的引用，并添加/移除事件监听器。
   * @param {HTMLDivElement | null} node - 图片内容 DOM 元素。
   */
  const setContentRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (imageContentElementRef.current) {
        imageContentElementRef.current.removeEventListener('wheel', handleWheelEvent);
        imageContentElementRef.current.removeEventListener('touchstart', handleTouchStart);
        imageContentElementRef.current.removeEventListener('touchmove', handleTouchMove);
        imageContentElementRef.current.removeEventListener('touchend', handleTouchEnd);
      }
      imageContentElementRef.current = node;
      if (node) {
        node.addEventListener('wheel', handleWheelEvent, { passive: false });
        node.addEventListener('touchstart', handleTouchStart, { passive: false });
        node.addEventListener('touchmove', handleTouchMove, { passive: false });
        node.addEventListener('touchend', handleTouchEnd, { passive: false });
      }
    },
    [handleWheelEvent, handleTouchStart, handleTouchMove, handleTouchEnd]
  );

  // 当图片源改变时，重置缩放和旋转状态
  useEffect(() => {
    setScale(1);
    setRotation(0);
  }, [src]);

  // 控制 body 的滚动，当模态框打开时禁止滚动
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

  // 监听键盘 Esc 键，用于关闭模态框
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  /**
   * 处理向右旋转操作。
   */
  const handleRotateRight = useCallback(() => {
    setRotation(r => r + 90);
  }, []);

  /**
   * 处理向左旋转操作。
   */
  const handleRotateLeft = useCallback(() => {
    setRotation(r => r - 90);
  }, []);

  /**
   * 处理重置缩放和旋转操作。
   */
  const handleReset = useCallback(() => {
    setScale(1);
    setRotation(0);
  }, []);

  /**
   * 处理图片下载的函数。
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
            transition: 'transform 0.2s ease-out', // 平滑过渡动画
            touchAction: 'none', // 阻止浏览器默认的平移和缩放手势，由我们自己处理
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
