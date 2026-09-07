import React, { useRef } from 'react';
import { exportDataWithDialog, importData } from '../lib/tauri';
import toast from 'react-hot-toast';

interface Props {
  onImportComplete: () => void;
}

export default function ImportExport({ onImportComplete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async (format: 'json' | 'txt') => {
  try {
    const success = await exportDataWithDialog(format);
    if (success) {
      toast.success('导出成功');
    }
    // 如果 success 为 false，说明用户取消了，不提示任何消息
  } catch (e) {
    toast.error('导出失败：' + e);
  }
};

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      if (!content) return;
      try {
        const mode = confirm('选择 "确定" 合并数据，"取消" 覆盖数据') ? 'merge' : 'overwrite';
        await importData(content, mode);
        toast.success('导入成功');
        onImportComplete();
      } catch (err) {
        toast.error('导入失败，请检查文件格式');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex space-x-2">
      <button
        onClick={() => handleExport('json')}
        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
      >
        导出 JSON
      </button>
      <button
        onClick={() => handleExport('txt')}
        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
      >
        导出 TXT
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        导入 JSON
      </button>
      <input
        type="file"
        accept=".json"
        ref={fileInputRef}
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}