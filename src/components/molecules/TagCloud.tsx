// src/components/molecules/TagCloud.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Tag from '@/components/atoms/Tag';
import { type TagInfo } from '@/lib/posts';
import { Search, X } from 'lucide-react';

// 核心修正：更新 Props 接口，添加新的字典键
interface TagCloudProps {
  tags: TagInfo[];
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
  dictionary: {
    search_placeholder: string;
    show_all: string;
    all_tags_label: string; // 核心新增：用于“全部”标签的文本
    collapse_tags: string; // 核心新增：用于“收起部分标签”的文本
  };
}

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
 * 1. “全部”标签的文本现在从 `dictionary.all_tags_label` 获取。
 * 2. “收起部分标签”的文本现在从 `dictionary.collapse_tags` 获取。
 *
 * @param {TagCloudProps} props - 组件属性。
 */
const TagCloud: React.FC<TagCloudProps> = ({ tags, activeTag, onTagClick, dictionary }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredTags = useMemo(() => {
    return tags.filter(tagInfo => tagInfo.tag.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [tags, searchTerm]);

  const displayedTags = isExpanded ? filteredTags : filteredTags.slice(0, 10);

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const showAllText = dictionary.show_all.replace('{count}', filteredTags.length.toString());

  return (
    <div className="tag-cloud-container">
      <div className="tag-search-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          placeholder={dictionary.search_placeholder}
          className="tag-search-input"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
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
          label={dictionary.all_tags_label}
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
            {isExpanded ? dictionary.collapse_tags : showAllText}
          </button>
        </div>
      )}
    </div>
  );
};

export default TagCloud;
