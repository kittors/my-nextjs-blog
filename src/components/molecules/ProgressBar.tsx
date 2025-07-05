// src/components/molecules/ProgressBar.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

/**
 * ProgressBar 组件：在页面加载和路由跳转时显示顶部加载进度条。
 *
 * 核心重构：
 * 这个组件的逻辑已被简化。它现在只负责在路由变化完成后（即组件重新渲染后）
 * 调用 `NProgress.done()` 来结束进度条。
 * 启动进度条的逻辑 (`NProgress.start()`) 已被移至一个更合适的位置（如 PageContainer），
 * 通过全局事件监听来实现，从而确保进度条在导航开始前就显示。
 */
const ProgressBar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 每当路由（pathname 或 searchParams）发生变化时，
  // 这个 effect 就会运行，表明导航已完成，此时应该结束进度条。
  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // 此组件是纯粹的副作用，不渲染任何 DOM 元素。
  return null;
};

export default ProgressBar;
