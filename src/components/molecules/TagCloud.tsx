// src/components/molecules/TagCloud.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Tag from '@/components/atoms/Tag';
import { type TagInfo } from '@/lib/posts';
import { Search } from 'lucide-react';

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
 * 它由多个 Tag 原子组件和一个搜索输入框组成，并封装了以下核心逻辑：
 * 1. 标签的搜索过滤。
 * 2. 标签列表的展开与折叠。
 * 3. 为每个标签分配一个独特的、循环的颜色。
 *
 * @param {TagCloudProps} props - 组件属性。
 */
const TagCloud: React.FC<TagCloudProps> = ({ tags, activeTag, onTagClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // 根据搜索词过滤标签
  const filteredTags = useMemo(() => {
    return tags.filter(tagInfo => tagInfo.tag.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tags, searchTerm]);

  // 决定显示哪些标签（是否展开）
  const displayedTags = isExpanded ? filteredTags : filteredTags.slice(0, 10);

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
      </div>
      <div className="tags-wrapper">
        {/* “全部” 按钮，用于清除筛选 */}
        <Tag
          label="全部"
          count={tags.length}
          onClick={() => onTagClick(null)}
          isActive={activeTag === null}
          colorClass="tag-color-all"
        />
        {/* 渲染标签列表 */}
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
      {/* 如果有超过10个标签，则显示展开/折叠按钮 */}
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
