// src/components/molecules/TagCloud.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Tag from '@/components/atoms/Tag';
import { type TagInfo } from '@/lib/posts';
import { Search, X } from 'lucide-react'; // 核心新增：导入 X 图标

// 定义 TagCloud 组件的 Props 类型
interface TagCloudProps {
  tags: TagInfo[];
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
}

// 预定义的颜色类名，用于给标签上色
const colorClasses = [
  'tag-color-1',
  'tag-color-2',
  'tag-color-3',
  'tag-color-4',
  'tag-color-5',
  'tag-color-6',
  'tag-color-7',
  'tag-color-8',
];

/**
 * TagCloud 组件：一个分子级别的 UI 组件，用于显示、搜索和过滤标签。
 *
 * 核心修正：
 * 1. 在搜索框内增加了一个清除按钮（X）。
 * 2. 此按钮仅在用户输入了搜索词时可见。
 * 3. 点击此按钮会立即清空搜索框，提升了用户操作的便捷性。
 *
 * @param {TagCloudProps} props - 组件属性。
 */
const TagCloud: React.FC<TagCloudProps> = ({ tags, activeTag, onTagClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredTags = useMemo(() => {
    return tags.filter(tagInfo => tagInfo.tag.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tags, searchTerm]);

  const displayedTags = isExpanded ? filteredTags : filteredTags.slice(0, 10);

  // 新增：处理清除搜索的函数
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="tag-cloud-container">
      <div className="tag-search-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder="搜索标签..."
          className="tag-search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        {/* 仅在 searchTerm 有值时渲染清除按钮 */}
        {searchTerm && (
          <button
            onClick={handleClearSearch}
            className="tag-search-clear-button"
            aria-label="清除搜索"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <div className="tags-wrapper">
        <Tag
          label="全部"
          count={tags.length}
          onClick={() => onTagClick(null)}
          isActive={activeTag === null}
          colorClass="tag-color-all"
        />
        {displayedTags.map((tagInfo, index) => (
          <Tag
            key={tagInfo.tag}
            label={tagInfo.tag}
            count={tagInfo.count}
            onClick={() => onTagClick(tagInfo.tag)}
            isActive={activeTag === tagInfo.tag}
            colorClass={colorClasses[index % colorClasses.length]}
          />
        ))}
      </div>
      {filteredTags.length > 10 && (
        <div className="tag-expand-button-wrapper">
          <button onClick={() => setIsExpanded(!isExpanded)} className="tag-expand-button">
            {isExpanded ? '收起部分标签' : `查看全部 ${filteredTags.length} 个标签`}
          </button>
        </div>
      )}
    </div>
  );
};

export default TagCloud;
