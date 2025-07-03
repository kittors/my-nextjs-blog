// src/contexts/SearchModalContext.tsx
'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';

// 定义上下文提供的值的类型
interface SearchModalContextType {
  openSearchModal: () => void;
  closeSearchModal: () => void;
}

// 创建 Context
const SearchModalContext = createContext<SearchModalContextType | undefined>(undefined);

interface SearchModalProviderProps {
  children: ReactNode;
  // 接收 PageContainer 传递的控制模态框的函数
  setModalOpen: (isOpen: boolean) => void;
}

/**
 * SearchModalProvider 组件：提供一个 Context，允许子组件控制搜索模态框的显示状态。
 * @param {SearchModalProviderProps} props - 组件属性。
 */
export const SearchModalProvider: React.FC<SearchModalProviderProps> = ({
  children,
  setModalOpen,
}) => {
  const openSearchModal = useCallback(() => {
    setModalOpen(true);
  }, [setModalOpen]);

  const closeSearchModal = useCallback(() => {
    setModalOpen(false);
  }, [setModalOpen]);

  return (
    <SearchModalContext.Provider value={{ openSearchModal, closeSearchModal }}>
      {children}
    </SearchModalContext.Provider>
  );
};

/**
 * useSearchModal Hook：用于在组件中方便地访问 SearchModalContext。
 * @returns {SearchModalContextType} 包含 openSearchModal 和 closeSearchModal 函数的对象。
 * @throws {Error} 如果在 SearchModalProvider 之外使用。
 */
export const useSearchModal = (): SearchModalContextType => {
  const context = useContext(SearchModalContext);
  if (context === undefined) {
    throw new Error('useSearchModal must be used within a SearchModalProvider');
  }
  return context;
};
