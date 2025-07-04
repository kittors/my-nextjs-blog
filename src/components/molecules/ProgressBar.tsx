// src/components/molecules/ProgressBar.tsx
'use client';

import { useEffect, useRef } from 'react'; // 核心新增：导入 useRef
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';

/**
 * ProgressBar 组件：在页面加载和路由跳转时显示顶部加载进度条。
 * 这是一个分子组件，负责 UI 反馈的逻辑。
 *
 * 核心修正：
 * 1. 使用 useRef 存储上一次的完整 URL（不含 hash），以区分真正的页面导航和仅 hash 变化。
 * 2. 只有当 URL 的非 hash 部分发生变化时，才启动 NProgress。
 * 3. 确保 NProgress 在页面内容渲染后结束。
 */
const ProgressBar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 使用 useRef 存储上一次的完整 URL（不含 hash），初始值为 null
  const lastUrlWithoutHashRef = useRef<string | null>(null);

  useEffect(() => {
    // 获取当前 URL 的 pathname 和 searchParams 字符串
    const currentPath = pathname;
    const currentSearch = searchParams.toString();
    // 组合成不包含 hash 的完整 URL 字符串
    const currentUrlWithoutHash = `${currentPath}${currentSearch ? `?${currentSearch}` : ''}`;

    // 核心逻辑：检查当前 URL（不含 hash）是否与上一次记录的不同
    // 如果是首次加载（lastUrlWithoutHashRef.current 为 null）
    // 或者 URL 的非 hash 部分发生了变化，则启动 NProgress。
    if (
      lastUrlWithoutHashRef.current === null ||
      lastUrlWithoutHashRef.current !== currentUrlWithoutHash
    ) {
      NProgress.start(); // 启动进度条
      // console.log('NProgress START: URL changed to', currentUrlWithoutHash);
      // 更新上一次的 URL 记录
      lastUrlWithoutHashRef.current = currentUrlWithoutHash;
    } else {
      // 如果只有 hash 变化，或者 URL 的非 hash 部分没有变化，则不启动 NProgress。
      // console.log('NProgress SKIPPED (hash only change or no change):', currentUrlWithoutHash);
    }

    // 设置一个定时器，在短时间后结束进度条。
    // 这模拟了页面内容加载和渲染完成的时间，确保进度条不会一直显示。
    const timer = setTimeout(() => {
      NProgress.done(); // 结束进度条
      // console.log('NProgress DONE (timed out):', currentUrlWithoutHash);
    }, 300); // 300ms 的延迟通常足够覆盖大部分客户端渲染和水合时间

    // 清理函数：
    // 在组件卸载时，或者在依赖项（pathname 或 searchParams）再次变化（新的导航开始）之前，
    // 清除当前定时器，并确保 NProgress 结束。
    return () => {
      clearTimeout(timer); // 清除未完成的定时器
      NProgress.done(); // 确保进度条状态被重置
      // console.log('NProgress CLEANUP:', currentUrlWithoutHash);
    };
  }, [pathname, searchParams]); // 依赖项为 pathname 和 searchParams

  return null; // 进度条是纯粹的副作用，不渲染任何 DOM 元素
};

export default ProgressBar;
