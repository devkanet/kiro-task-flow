import { Task } from '../types';

export const STORAGE_KEY = 'taskflow_tasks';

/**
 * 読み込んだデータが Task[] のスキーマを満たすか検証する。
 * 配列かつ各要素が id/title/description/dueDate (string) と completed (boolean) を持つことを確認する。
 */
export function isValidTaskList(data: unknown): data is Task[] {
  if (!Array.isArray(data)) return false;
  return data.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof (item as Record<string, unknown>).id === 'string' &&
      typeof (item as Record<string, unknown>).title === 'string' &&
      typeof (item as Record<string, unknown>).description === 'string' &&
      typeof (item as Record<string, unknown>).dueDate === 'string' &&
      typeof (item as Record<string, unknown>).completed === 'boolean',
  );
}

/**
 * Task[] を JSON シリアライズして localStorage に書き込む。
 * 書き込み失敗時は例外を throw せず { ok: false } を返す。
 */
export function saveTasks(tasks: Task[]): { ok: boolean } {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return { ok: true };
  } catch (error) {
    console.error('[TaskFlow] saveTasks: Failed to write localStorage', error);
    return { ok: false };
  }
}

/**
 * localStorage から Task[] を読み込む。
 * - キーが存在しない場合は空配列を返す（初回起動扱い）
 * - JSON パース失敗時: { error: 'parse' } を返し localStorage は変更しない
 * - スキーマ不一致時: { error: 'schema' } を返し localStorage は変更しない
 */
export function loadTasks(): { tasks: Task[] } | { error: 'parse' | 'schema' } {
  const raw = localStorage.getItem(STORAGE_KEY);

  // キー未設定（初回起動）
  if (raw === null) {
    return { tasks: [] };
  }

  // JSON パース
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    console.error('[TaskFlow] loadTasks: Failed to parse JSON', error);
    return { error: 'parse' };
  }

  // スキーマ検証
  if (!isValidTaskList(parsed)) {
    console.error('[TaskFlow] loadTasks: Data does not match Task[] schema', parsed);
    return { error: 'schema' };
  }

  return { tasks: parsed };
}
