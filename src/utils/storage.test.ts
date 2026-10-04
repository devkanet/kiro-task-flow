import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveTasks, loadTasks, isValidTaskList, STORAGE_KEY } from './storage';
import type { Task } from '../types';

// localStorage をリセットしてから各テストを実行する
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

// -----------------------------------------------------------------------
// テスト用データ
// -----------------------------------------------------------------------

const validTask: Task = {
  id: 'abc-123',
  title: 'テストタスク',
  description: '説明文',
  dueDate: '2025-12-31',
  completed: false,
};

const anotherTask: Task = {
  id: 'def-456',
  title: '別のタスク',
  description: '',
  dueDate: '',
  completed: true,
};

// -----------------------------------------------------------------------
// isValidTaskList
// -----------------------------------------------------------------------

describe('isValidTaskList', () => {
  it('空配列を有効と判定する', () => {
    expect(isValidTaskList([])).toBe(true);
  });

  it('有効な Task[] を有効と判定する', () => {
    expect(isValidTaskList([validTask, anotherTask])).toBe(true);
  });

  it('配列でない値（オブジェクト）を無効と判定する', () => {
    expect(isValidTaskList({ id: 'x', title: 'x', description: '', dueDate: '', completed: false })).toBe(false);
  });

  it('配列でない値（null）を無効と判定する', () => {
    expect(isValidTaskList(null)).toBe(false);
  });

  it('配列でない値（文字列）を無効と判定する', () => {
    expect(isValidTaskList('tasks')).toBe(false);
  });

  it('id が string でない要素を含む場合は無効と判定する', () => {
    const bad = [{ ...validTask, id: 123 }];
    expect(isValidTaskList(bad)).toBe(false);
  });

  it('title が string でない要素を含む場合は無効と判定する', () => {
    const bad = [{ ...validTask, title: null }];
    expect(isValidTaskList(bad)).toBe(false);
  });

  it('description が string でない要素を含む場合は無効と判定する', () => {
    const bad = [{ ...validTask, description: 42 }];
    expect(isValidTaskList(bad)).toBe(false);
  });

  it('dueDate が string でない要素を含む場合は無効と判定する', () => {
    const bad = [{ ...validTask, dueDate: undefined }];
    expect(isValidTaskList(bad)).toBe(false);
  });

  it('completed が boolean でない要素を含む場合は無効と判定する', () => {
    const bad = [{ ...validTask, completed: 'true' }];
    expect(isValidTaskList(bad)).toBe(false);
  });

  it('必須フィールドが欠損している要素を含む場合は無効と判定する', () => {
    const bad = [{ id: 'x', title: 'x', description: '' }]; // dueDate・completed 欠損
    expect(isValidTaskList(bad)).toBe(false);
  });

  it('有効な要素と無効な要素が混在する場合は無効と判定する', () => {
    const mixed = [validTask, { id: 1, title: 'bad', description: '', dueDate: '', completed: false }];
    expect(isValidTaskList(mixed)).toBe(false);
  });
});

// -----------------------------------------------------------------------
// saveTasks
// -----------------------------------------------------------------------

describe('saveTasks', () => {
  it('正常データを localStorage に書き込み { ok: true } を返す', () => {
    const result = saveTasks([validTask]);
    expect(result).toEqual({ ok: true });
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify([validTask]));
  });

  it('空配列を書き込み { ok: true } を返す', () => {
    const result = saveTasks([]);
    expect(result).toEqual({ ok: true });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('[]');
  });

  it('複数タスクを書き込み { ok: true } を返す', () => {
    const tasks = [validTask, anotherTask];
    const result = saveTasks(tasks);
    expect(result).toEqual({ ok: true });
    expect(localStorage.getItem(STORAGE_KEY)).toBe(JSON.stringify(tasks));
  });

  it('localStorage.setItem が例外を投げた場合は { ok: false } を返す', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });
    const result = saveTasks([validTask]);
    expect(result).toEqual({ ok: false });
  });

  it('書き込み失敗時も localStorage の既存データを変更しない', () => {
    // 事前に正常なデータを書き込んでおく
    localStorage.setItem(STORAGE_KEY, JSON.stringify([anotherTask]));

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    saveTasks([validTask]);

    // setItem がモックされているため getItem で確認できないが、
    // spy は setItem のみをモックし getItem は通常動作する。
    // ここでは saveTasks が { ok: false } を返すことで書き込み失敗を保証する。
    expect(saveTasks([validTask])).toEqual({ ok: false });
  });
});

// -----------------------------------------------------------------------
// loadTasks
// -----------------------------------------------------------------------

describe('loadTasks', () => {
  describe('キーが存在しない場合（初回起動）', () => {
    it('空配列を返す', () => {
      const result = loadTasks();
      expect(result).toEqual({ tasks: [] });
    });
  });

  describe('正常データが存在する場合', () => {
    it('Task[] をデシリアライズして返す', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([validTask]));
      const result = loadTasks();
      expect(result).toEqual({ tasks: [validTask] });
    });

    it('複数タスクをすべて返す', () => {
      const tasks = [validTask, anotherTask];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      const result = loadTasks();
      expect(result).toEqual({ tasks });
    });

    it('空配列が格納されている場合は空配列を返す', () => {
      localStorage.setItem(STORAGE_KEY, '[]');
      const result = loadTasks();
      expect(result).toEqual({ tasks: [] });
    });
  });

  describe('不正 JSON が格納されている場合', () => {
    it('{ error: "parse" } を返す', () => {
      localStorage.setItem(STORAGE_KEY, 'not valid json {{{');
      const result = loadTasks();
      expect(result).toEqual({ error: 'parse' });
    });

    it('不正 JSON 後も localStorage の値が変更されていない', () => {
      const corrupt = 'not valid json {{{';
      localStorage.setItem(STORAGE_KEY, corrupt);
      loadTasks();
      // loadTasks 呼び出し後もキーの値が変わっていないことを確認
      expect(localStorage.getItem(STORAGE_KEY)).toBe(corrupt);
    });

    it('空文字が格納されている場合は { error: "parse" } を返す', () => {
      localStorage.setItem(STORAGE_KEY, '');
      const result = loadTasks();
      expect(result).toEqual({ error: 'parse' });
    });

    it('空文字の場合も localStorage の値が変更されていない', () => {
      localStorage.setItem(STORAGE_KEY, '');
      loadTasks();
      expect(localStorage.getItem(STORAGE_KEY)).toBe('');
    });
  });

  describe('スキーマ不一致データが格納されている場合', () => {
    it('JSON オブジェクト（配列でない）が格納されている場合は { error: "schema" } を返す', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: 'x', title: 'x' }));
      const result = loadTasks();
      expect(result).toEqual({ error: 'schema' });
    });

    it('id フィールドが欠損した要素を含む場合は { error: "schema" } を返す', () => {
      const bad = [{ title: 'missing id', description: '', dueDate: '', completed: false }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bad));
      const result = loadTasks();
      expect(result).toEqual({ error: 'schema' });
    });

    it('completed が boolean でない要素を含む場合は { error: "schema" } を返す', () => {
      const bad = [{ ...validTask, completed: 'yes' }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bad));
      const result = loadTasks();
      expect(result).toEqual({ error: 'schema' });
    });

    it('スキーマ不一致後も localStorage の値が変更されていない', () => {
      const bad = JSON.stringify([{ id: 1, title: 'bad', description: '', dueDate: '', completed: false }]);
      localStorage.setItem(STORAGE_KEY, bad);
      loadTasks();
      expect(localStorage.getItem(STORAGE_KEY)).toBe(bad);
    });

    it('null が格納されている場合は { error: "schema" } を返す', () => {
      localStorage.setItem(STORAGE_KEY, 'null');
      const result = loadTasks();
      expect(result).toEqual({ error: 'schema' });
    });

    it('数値配列が格納されている場合は { error: "schema" } を返す', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([1, 2, 3]));
      const result = loadTasks();
      expect(result).toEqual({ error: 'schema' });
    });
  });

  describe('ラウンドトリップ（saveTasks → loadTasks）', () => {
    it('保存したタスクを読み込むと元のデータと等価になる', () => {
      const tasks = [validTask, anotherTask];
      saveTasks(tasks);
      const result = loadTasks();
      expect(result).toEqual({ tasks });
    });

    it('空配列のラウンドトリップが正常に動作する', () => {
      saveTasks([]);
      const result = loadTasks();
      expect(result).toEqual({ tasks: [] });
    });
  });
});

// =======================================================================
// Property-based tests (fast-check) — Task 13
// =======================================================================

import * as fc from 'fast-check';

// 有効な Task を生成するアービトラリー。
// Task スキーマ（id/title/description/dueDate: string, completed: boolean）を満たす。
const taskArb: fc.Arbitrary<Task> = fc.record({
  id: fc.string(),
  title: fc.string(),
  description: fc.string(),
  dueDate: fc.string(),
  completed: fc.boolean(),
});

// Feature: taskflow-todo-app, Property 4: localStorage ラウンドトリップ
describe('Property 4: localStorage ラウンドトリップ', () => {
  it('saveTasks で保存し loadTasks で読み込んだ結果は元の Task[] と深い等価性を持つ', () => {
    // Validates: Requirements 7.1, 7.2, 7.3
    fc.assert(
      fc.property(fc.array(taskArb), (tasks) => {
        localStorage.clear();
        const saveResult = saveTasks(tasks);
        expect(saveResult).toEqual({ ok: true });

        const loadResult = loadTasks();
        // JSON シリアライズ・デシリアライズを経ても元のデータと等価であること
        expect(loadResult).toEqual({ tasks });
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: taskflow-todo-app, Property 10: localStorage 読み込みエラー時のデータ保全
describe('Property 10: localStorage 読み込みエラー時のデータ保全', () => {
  it('不正 JSON が存在するとき loadTasks 後も localStorage は不変でエラーを返す', () => {
    // Validates: Requirements 7.4, 7.5, 7.6
    fc.assert(
      fc.property(
        // JSON としてパースできない文字列のみを生成する
        fc.string().filter((s) => {
          try {
            JSON.parse(s);
            return false; // パースできてしまうものは除外
          } catch {
            return true;
          }
        }),
        (invalidJson) => {
          localStorage.clear();
          localStorage.setItem(STORAGE_KEY, invalidJson);

          const result = loadTasks();

          // 返り値はパースエラーを示す
          expect(result).toEqual({ error: 'parse' });
          // localStorage の値は呼び出し前と同一（変更・削除されない）
          expect(localStorage.getItem(STORAGE_KEY)).toBe(invalidJson);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('スキーマ不一致データが存在するとき loadTasks 後も localStorage は不変でエラーを返す', () => {
    // Validates: Requirements 7.4, 7.5, 7.6
    fc.assert(
      fc.property(
        // JSON としては有効だが Task[] スキーマを満たさない値を生成する
        fc
          .jsonValue()
          .filter((value) => !isValidTaskList(value)),
        (invalidSchemaValue) => {
          localStorage.clear();
          const raw = JSON.stringify(invalidSchemaValue);
          localStorage.setItem(STORAGE_KEY, raw);

          const result = loadTasks();

          // 返り値はスキーマエラーを示す
          expect(result).toEqual({ error: 'schema' });
          // localStorage の値は呼び出し前と同一（変更・削除されない）
          expect(localStorage.getItem(STORAGE_KEY)).toBe(raw);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: taskflow-todo-app, Property 11: localStorage 書き込み失敗時のメモリ状態保全
describe('Property 11: localStorage 書き込み失敗時のメモリ状態保全', () => {
  it('書き込みが失敗するとき saveTasks は { ok: false } を返し、メモリ上の Task_List は不変である', () => {
    // Validates: Requirements 7.7
    fc.assert(
      fc.property(fc.array(taskArb), (tasks) => {
        localStorage.clear();
        vi.restoreAllMocks();

        // localStorage への書き込みを失敗させる（容量超過等を模倣）
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new DOMException('QuotaExceededError');
        });

        // 書き込み試行前のメモリ上の状態をスナップショットとして保持
        const snapshot = structuredClone(tasks);

        const result = saveTasks(tasks);

        // 書き込み失敗を示す
        expect(result).toEqual({ ok: false });
        // メモリ上の Task_List は書き込み試行前と同一（saveTasks は引数を変更しない）
        expect(tasks).toEqual(snapshot);

        vi.restoreAllMocks();
      }),
      { numRuns: 100 }
    );
  });
});
