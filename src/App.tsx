import React, { useEffect, useState, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import ExcerptList from './components/ExcerptList';
import { useClipboard } from './hooks/useClipboard';
import { insertExcerpt, getAllExcerpts } from './lib/tauri';
import toast from 'react-hot-toast';

function App() {
  const clipboardText = useClipboard();
  const [isVisible, setIsVisible] = useState(true);
  const lastSavedText = useRef<string>(''); // 记录最后一条保存的内容

  useEffect(() => {
    // 窗口可见性监听（如果有托盘，后续可以恢复）
  }, []);

  useEffect(() => {
    const saveExcerpt = async () => {
      if (!clipboardText || !clipboardText.trim()) return;

      // 如果和上一条保存的内容相同，跳过
      if (clipboardText === lastSavedText.current) return;

      // 查询数据库中最近的一条记录，检查是否重复
      try {
        const excerpts = await getAllExcerpts();
        if (excerpts.length > 0 && excerpts[0].content === clipboardText) {
          // 最近一条内容相同，说明是重复复制
          lastSavedText.current = clipboardText; // 更新缓存，防止下次再触发
          return;
        }
      } catch (e) {
        // 查询失败时仍尝试保存，不阻塞用户
        console.error('查询最近记录失败:', e);
      }

      // 保存新摘录
      try {
        await insertExcerpt({
          content: clipboardText,
          note: null,
          tags: [],
          starred: 0,
          created_at: new Date().toISOString(),
        });
        lastSavedText.current = clipboardText;
        toast.success('已自动摘录');
      } catch (e) {
        console.error('保存摘录失败:', e);
      }
    };

    saveExcerpt();
  }, [clipboardText]);

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      {isVisible && <ExcerptList />}
    </div>
  );
}

export default App;