import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import ExcerptList from './components/ExcerptList';
import { useClipboard } from './hooks/useClipboard';
import { insertExcerpt } from './lib/tauri';
import toast from 'react-hot-toast';
import { listen } from '@tauri-apps/api/event';

function App() {
  const clipboardText = useClipboard();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const unlisten = listen('window-visible', (event) => {
      setIsVisible(event.payload as boolean);
    });
    return () => { unlisten.then(f => f()); };
  }, []);

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
      {isVisible && <ExcerptList />}
    </div>
  );
}

export default App;
