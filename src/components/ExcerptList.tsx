import React, { useEffect, useState } from 'react';
import { getAllExcerpts, deleteAllExcerpts } from '../lib/tauri';
import { Excerpt } from '../types';
import ExcerptItem from './ExcerptItem';
import SearchBar from './SearchBar';
import TagFilter from './TagFilter';
import ImportExport from './ImportExport';
import toast from 'react-hot-toast';

export default function ExcerptList() {
  const [excerpts, setExcerpts] = useState<Excerpt[]>([]);
  const [filtered, setFiltered] = useState<Excerpt[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const loadExcerpts = async () => {
    try {
      const data = await getAllExcerpts();
      setExcerpts(data);
      applyFilters(data, searchTerm, selectedTags);
    } catch (e) {
      toast.error('加载数据失败');
    }
  };

  const applyFilters = (data: Excerpt[], term: string, tags: string[]) => {
    let filtered = data;
    if (term.trim()) {
      const lower = term.toLowerCase();
      filtered = filtered.filter(e =>
        e.content.toLowerCase().includes(lower) ||
        (e.note && e.note.toLowerCase().includes(lower)) ||
        e.tags.some(t => t.toLowerCase().includes(lower))
      );
    }
    if (tags.length > 0) {
      filtered = filtered.filter(e => tags.some(t => e.tags.includes(t)));
    }
    setFiltered(filtered);
  };

  useEffect(() => {
    loadExcerpts();
  }, []);

  useEffect(() => {
    applyFilters(excerpts, searchTerm, selectedTags);
  }, [excerpts, searchTerm, selectedTags]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleTagSelect = (tags: string[]) => {
    setSelectedTags(tags);
  };

  const handleUpdate = () => {
    loadExcerpts();
  };

  const handleClearAll = async () => {
    if (confirm('确定清空所有摘录吗？')) {
      await deleteAllExcerpts();
      handleUpdate();
      toast.success('已清空');
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📘 灵摘</h1>
        <div className="flex items-center space-x-2">
          <ImportExport onImportComplete={handleUpdate} />
          <button
            onClick={handleClearAll}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            清空
          </button>
        </div>
      </div>

      <SearchBar onSearch={handleSearch} />
      <TagFilter excerpts={excerpts} selectedTags={selectedTags} onSelect={handleTagSelect} />

      <div className="mt-4">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">暂无摘录，复制文本即可自动记录</p>
        ) : (
          filtered.map(ex => (
            <ExcerptItem key={ex.id} excerpt={ex} onUpdate={handleUpdate} />
          ))
        )}
      </div>
      <div className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-right">
        共 {filtered.length} 条 / 总计 {excerpts.length} 条
      </div>
    </div>
  );
}