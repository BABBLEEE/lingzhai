import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import ExcerptList from './components/ExcerptList';
import { useClipboard } from './hooks/useClipboard';
import { insertExcerpt } from './lib/tauri';
import toast from 'react-hot-toast';

function App() {
  const clipboardText = useClipboard();

  useEffect(() => {
    if (clipboardText && clipboardText.trim()) {
      insertExcerpt({
        content: clipboardText,
        note: null,
        tags: [],
        starred: 0,
        created_at: new Date().toISOString(),
      }).then(() => {
        toast.success('已自动摘录');
      }).catch(console.error);
    }
  }, [clipboardText]);

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      <ExcerptList />
    </div>
  );
}

export default App;