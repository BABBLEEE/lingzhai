import React from 'react';
import { Excerpt } from '../types';

interface Props {
  excerpts: Excerpt[];
  selectedTags: string[];
  onSelect: (tags: string[]) => void;
}

export default function TagFilter({ excerpts, selectedTags, onSelect }: Props) {
  const tagCount: Record<string, number> = {};
  excerpts.forEach(e => {
    e.tags.forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
  });
  const tags = Object.keys(tagCount).sort();

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onSelect(selectedTags.filter(t => t !== tag));
    } else {
      onSelect([...selectedTags, tag]);
    }
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {tags.map(tag => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={`px-3 py-1 text-sm rounded-full border ${
            selectedTags.includes(tag)
              ? 'bg-blue-500 text-white border-blue-500'
              : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
          } transition`}
        >
          #{tag} ({tagCount[tag]})
        </button>
      ))}
      {selectedTags.length > 0 && (
        <button onClick={() => onSelect([])} className="text-sm text-gray-500 hover:underline">
          清除筛选
        </button>
      )}
    </div>
  );
}
