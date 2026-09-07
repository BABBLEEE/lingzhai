import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs'; 
import type { Excerpt, NewExcerpt } from '../types';

export async function getAllExcerpts(): Promise<Excerpt[]> {
  return await invoke('get_all_excerpts');
}

export async function insertExcerpt(excerpt: NewExcerpt): Promise<number> {
  return await invoke('insert_excerpt', { excerpt });
}

export async function updateExcerpt(excerpt: Excerpt): Promise<void> {
  await invoke('update_excerpt', { excerpt });
}

export async function deleteExcerpt(id: number): Promise<void> {
  await invoke('delete_excerpt', { id });
}

export async function deleteAllExcerpts(): Promise<void> {
  await invoke('delete_all_excerpts');
}

export async function exportDataWithDialog(format: 'json' | 'txt'): Promise<boolean> {
  try {
    const filePath = await save({ 
      defaultPath: `lingzhai_backup.${format === 'json' ? 'json' : 'txt'}`,
      filters: [
        {
          name: format === 'json' ? 'JSON 文件' : '文本文件',
          extensions: [format === 'json' ? 'json' : 'txt'],
        },
      ],
    });
    if (!filePath) {
      return false; // 用户取消了
    }
    const content = await invoke<string>('export_data', { format });
    await writeTextFile(filePath, content);
    return true; // 导出成功
  } catch (error) {
    throw error; // 真正的错误
  }
}

export async function importData(jsonData: string, mode: 'merge' | 'overwrite'): Promise<void> {
  await invoke('import_data', { jsonData, mode });
}

export async function toggleWindowVisibility(): Promise<void> {
  await invoke('toggle_window_visibility');
}

export async function setAutoStart(enabled: boolean): Promise<void> {
  await invoke('set_autostart', { enabled });
}
