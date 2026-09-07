import { invoke } from '@tauri-apps/api/core';
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

export async function exportData(format: 'json' | 'txt'): Promise<string> {
  return await invoke('export_data', { format });
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
