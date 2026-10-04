import { useState, useEffect, useRef } from 'react';
import type { Task } from '../types';
import { loadTasks, saveTasks } from '../utils/storage';

/**
 * localStorage との読み書きを一元管理するカスタム Hook。
 *
 * 返り値: [tasks, setTasks, storageError]
 * - tasks        : 読み込み完了後は Task[]、初期化前 / 読み込みエラー時は null
 * - setTasks     : tasks ステートを更新する関数（変更後に saveTasks() を実行）
 * - storageError : 読み込み失敗時 'load'、書き込み失敗時 'save'、問題なし null
 */
export function useTaskStorage(): [
  Task[] | null,
  (tasks: Task[]) => void,
  'load' | 'save' | null,
] {
  const [tasks, setTasksState] = useState<Task[] | null>(null);
  const [storageError, setStorageError] = useState<'load' | 'save' | null>(null);

  // tasks が null の間（初期化前 / 読み込みエラー）は saveTasks() を実行しないよう
  // 初期マウント時の useEffect を skip するためのフラグ
  const isInitialized = useRef(false);

  // マウント時に localStorage からデータを読み込む
  useEffect(() => {
    const result = loadTasks();
    if ('tasks' in result) {
      setTasksState(result.tasks);
    } else {
      // 読み込みエラー（parse / schema）: tasks は null のまま保持し
      // localStorage を変更しない（loadTasks 側で保証済み）
      setStorageError('load');
    }
    isInitialized.current = true;
  }, []);

  // tasks 変更時に localStorage へ書き込む
  // tasks が null の間（初期化前 / 読み込みエラー）は実行しない
  useEffect(() => {
    if (!isInitialized.current || tasks === null) return;

    const result = saveTasks(tasks);
    if (!result.ok) {
      setStorageError('save');
    }
     
  }, [tasks]);

  // 外部から tasks を更新するための setter
  const setTasks = (newTasks: Task[]) => {
    setTasksState(newTasks);
  };

  return [tasks, setTasks, storageError];
}
