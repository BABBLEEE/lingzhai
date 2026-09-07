import { useEffect, useState } from 'react';
import { readText } from '@tauri-apps/plugin-clipboard-manager';

export function useClipboard() {
  const [text, setText] = useState<string | null>(null);

  useEffect(() => {
    let lastText = '';

    const checkClipboard = async () => {
      try {
        const currentText = await readText();
        console.log('剪贴板内容:', currentText);
        if (currentText && currentText !== lastText) {
          lastText = currentText;
          setText(currentText);
        }
      } catch (error) {
        console.error('Clipboard read error:', error);
      }
    };

    const intervalId = setInterval(checkClipboard, 500);

    return () => clearInterval(intervalId);
  }, []);

  return text;
}