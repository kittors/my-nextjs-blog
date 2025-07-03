// src/components/molecules/ProgressBar.tsx
"use client";

import { useEffect, useState } from 'react'; // 导入 useState
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

/**
 * ProgressBar 组件：在页面加载和路由跳转时显示顶部加载进度条。
 * 这是一个分子组件，负责 UI 反馈的逻辑。
 */
const ProgressBar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false); // 新增状态，用于判断是否已在客户端挂载

  useEffect(() => {
    // 标记组件已在客户端挂载
    setIsMounted(true);
  }, []); // 仅在组件首次挂载时运行

  // 路由开始变化时显示进度条
  useEffect(() => {
    if (isMounted) { // 确保只在客户端挂载后执行
      NProgress.start();
      //console.log('NProgress START: path changed to', pathname, searchParams.toString());
    }
  }, [pathname, searchParams, isMounted]); // 监听 pathname, searchParams 和 isMounted 的变化

  // 在组件首次渲染（客户端）和每次路由/数据加载完成后调用 NProgress.done()
  useEffect(() => {
    if (isMounted) { // 确保只在客户端挂载后执行
      const timer = setTimeout(() => {
        NProgress.done();
        //console.log('NProgress DONE: after mount/render or path changed and content drawn');
      }, 300); // 延迟 300ms，给页面渲染和水合一些时间

      // 清理函数，在组件卸载或下次 effect 运行前调用 done()
      return () => {
        clearTimeout(timer);
        NProgress.done(); // 确保在组件卸载时进度条也会消失
      };
    }
  }, [isMounted]); // 仅在 isMounted 变化时运行

  return null; // 进度条是纯粹的副作用，不渲染任何 DOM 元素
};

export default ProgressBar;
