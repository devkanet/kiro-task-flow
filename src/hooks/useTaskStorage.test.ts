import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTaskStorage } from './useTaskStorage';
import { STORAGE_KEY } from '../utils/storage';
import type { Task } from '../types';

// localStorage をリセットしてから各テストを実行する
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// -----------------------------------------------------------------------
// テスト用データ
// -----------------------------------------------------------------------

const sampleTask: Task = {
  id: 'task-1',
  title: 'サンプルタスク',
  description: '説明',
  dueDate: '2025-12-31',
  completed: false,
};

const anotherTask: Task = {
  id: 'task-2',
  title: '別タスク',
  description: '',
  dueDate: '',
  completed: true,
};

// -----------------------------------------------------------------------
// 読み込み成功
// -----------------------------------------------------------------------

describe('読み込み成功時', () => {
  it('localStorage にデータがない場合は空配列を返す', async () => {
    const { result } = renderHook(() => useTaskStorage());

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    expect(result.current[2]).toBeNull(); // storageError = null
  });

  it('localStorage に有効な Task[] がある場合はそれを返す', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([sampleTask]));

    const { result } = renderHook(() => useTaskStorage());

    await waitFor(() => {
      expect(result.current[0]).toEqual([sampleTask]);
    });

    expect(result.current[2]).toBeNull();
  });

  it('複数タスクを正しく読み込む', async () => {
    const tasks = [sampleTask, anotherTask];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

    const { result } = renderHook(() => useTaskStorage());

    await waitFor(() => {
      expect(result.current[0]).toEqual(tasks);
    });

    expect(result.current[2]).toBeNull();
  });
});

// -----------------------------------------------------------------------
// 読み込みエラー
// -----------------------------------------------------------------------

describe('読み込みエラー時', () => {
  it('不正 JSON が格納されている場合は storageError = "load" をセットする', async () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json {{{');

    const { result } = renderHook(() => useTaskStorage());

    await waitFor(() => {
      expect(result.current[2]).toBe('load');
    });

    expect(result.current[0]).toBeNull(); // tasks は null のまま
  });

  it('スキーマ不一致データの場合は storageError = "load" をセットする', async () => {
    const bad = JSON.stringify([{ id: 1, title: 'bad', description: '', dueDate: '', completed: false }]);
    localStorage.setItem(STORAGE_KEY, bad);

    const { result } = renderHook(() => useTaskStorage());

    await waitFor(() => {
      expect(result.current[2]).toBe('load');
    });

    expect(result.current[0]).toBeNull();
  });

  it('読み込みエラー時は localStorage の値を変更しない', async () => {
    const corrupt = 'invalid json {{{';
    localStorage.setItem(STORAGE_KEY, corrupt);

    const { result } = renderHook(() => useTaskStorage());

    await waitFor(() => {
      expect(result.current[2]).toBe('load');
    });

    // localStorage の値は変わっていない
    expect(localStorage.getItem(STORAGE_KEY)).toBe(corrupt);
  });
});

// -----------------------------------------------------------------------
// tasks が null の間は saveTasks を呼ばない
// -----------------------------------------------------------------------

describe('tasks が null の間は saveTasks を実行しない', () => {
  it('読み込みエラー状態では setItem が呼ばれない', async () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json');

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    const { result } = renderHook(() => useTaskStorage());

    await waitFor(() => {
      expect(result.current[2]).toBe('load');
    });

    // tasks が null のまま → saveTasks は実行されない
    expect(setItemSpy).not.toHaveBeenCalled();
  });
});

// -----------------------------------------------------------------------
// tasks 変更時に saveTasks が呼ばれる
// -----------------------------------------------------------------------

describe('tasks 変更時の書き込み', () => {
  it('setTasks を呼ぶと localStorage に書き込まれる', async () => {
    const { result } = renderHook(() => useTaskStorage());

    // 初期化完了を待つ
    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    act(() => {
      result.current[1]([sampleTask]);
    });

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([sampleTask]));
    });

    expect(result.current[0]).toEqual([sampleTask]);
    expect(result.current[2]).toBeNull();
  });

  it('複数回 setTasks を呼ぶと最新の状態が localStorage に反映される', async () => {
    const { result } = renderHook(() => useTaskStorage());

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    act(() => {
      result.current[1]([sampleTask]);
    });

    await waitFor(() => {
      expect(result.current[0]).toEqual([sampleTask]);
    });

    act(() => {
      result.current[1]([sampleTask, anotherTask]);
    });

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([sampleTask, anotherTask]));
    });
  });
});

// -----------------------------------------------------------------------
// 書き込み失敗時に storageError = 'save' がセットされる
// -----------------------------------------------------------------------

describe('書き込み失敗時', () => {
  it('localStorage.setItem が例外を投げた場合は storageError = "save" をセットする', async () => {
    const { result } = renderHook(() => useTaskStorage());

    // 初期化完了を待つ
    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    // この時点から setItem を失敗させる
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    act(() => {
      result.current[1]([sampleTask]);
    });

    await waitFor(() => {
      expect(result.current[2]).toBe('save');
    });
  });

  it('書き込み失敗時もメモリ上の tasks は更新された値を保持する', async () => {
    const { result } = renderHook(() => useTaskStorage());

    await waitFor(() => {
      expect(result.current[0]).toEqual([]);
    });

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    act(() => {
      result.current[1]([sampleTask]);
    });

    await waitFor(() => {
      expect(result.current[2]).toBe('save');
    });

    // メモリ上の tasks は setTasks で渡した値を持つ
    expect(result.current[0]).toEqual([sampleTask]);
  });
});
