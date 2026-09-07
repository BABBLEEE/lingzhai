import React, { useState } from 'react';

interface Props {
  onSearch: (term: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const [term, setTerm] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTerm(val);
    onSearch(val);
  };

  return (
    <input
      type="text"
      placeholder="搜索内容、笔记、标签..."
      value={term}
      onChange={handleChange}
      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
    />
  );
}
