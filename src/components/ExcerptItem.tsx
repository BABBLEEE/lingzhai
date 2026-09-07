import React, { useState } from 'react';
import { Excerpt } from '../types';
import { updateExcerpt, deleteExcerpt } from '../lib/tauri';
import toast from 'react-hot-toast';

interface Props {
  excerpt: Excerpt;
  onUpdate: () => void;
}

export default function ExcerptItem({ excerpt, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(excerpt.note || '');
  const [tags, setTags] = useState(excerpt.tags.join(', '));

  const handleStar = async () => {
    await updateExcerpt({ ...excerpt, starred: excerpt.starred ? 0 : 1 });
    onUpdate();
  };

  const handleDelete = async () => {
    if (confirm('确定删除该摘录吗？')) {
      await deleteExcerpt(excerpt.id);
      onUpdate();
    }
  };

  const handleSaveNote = async () => {
    const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
    await updateExcerpt({
      ...excerpt,
      note: note.trim() || null,
      tags: tagArray,
    });
    setIsEditing(false);
    onUpdate();
    toast.success('已更新');
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="whitespace-pre-wrap text-sm">{excerpt.content}</p>
          {excerpt.note && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">✏️ {excerpt.note}</p>
          )}
          {excerpt.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {excerpt.tags.map(tag => (
                <span key={tag} className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <span className="text-xs text-gray-400 dark:text-gray-500 block mt-1">
            {new Date(excerpt.created_at).toLocaleString()}
          </span>
        </div>
        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={handleStar}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${excerpt.starred ? 'text-yellow-500' : 'text-gray-400'}`}
            title="星标"
          >
            {excerpt.starred ? '⭐' : '☆'}
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-red-500"
          >
            🗑️
          </button>
        </div>
      </div>
      {isEditing && (
        <div className="mt-3 border-t pt-3 dark:border-gray-700">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="笔记..."
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm"
            rows={2}
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签（用逗号分隔）"
            className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 text-sm mt-1"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button onClick={() => setIsEditing(false)} className="px-3 py-1 text-sm border rounded dark:border-gray-600">
              取消
            </button>
            <button onClick={handleSaveNote} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
