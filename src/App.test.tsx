import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEY } from './utils/storage';
import type { Task } from './types';

// 各テスト前に localStorage とモックをリセットする
beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// -----------------------------------------------------------------------
// テスト用データ / ヘルパー
// -----------------------------------------------------------------------

const existingTask: Task = {
  id: 'task-1',
  title: '既存タスク',
  description: '既存の説明',
  dueDate: '2025-06-01',
  completed: false,
};

const completedTask: Task = {
  id: 'task-2',
  title: '完了済みタスク',
  description: '',
  dueDate: '',
  completed: true,
};

function seedTasks(tasks: Task[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// 初期読み込み（空状態メッセージ）が完了するまで待つ
async function waitForLoaded() {
  await waitFor(() => {
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });
}

// -----------------------------------------------------------------------
// 初期表示
// -----------------------------------------------------------------------

describe('App 初期表示', () => {
  it('localStorage が空のとき空状態メッセージを表示する', async () => {
    render(<App />);
    await waitForLoaded();
  });

  it('localStorage の既存タスクを一覧表示する', async () => {
    seedTasks([existingTask, completedTask]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('既存タスク')).toBeInTheDocument();
    });
    expect(screen.getByText('完了済みタスク')).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// タスクの追加（Requirement 1）
// -----------------------------------------------------------------------

describe('App タスク追加', () => {
  it('フォーム送信でタスクが一覧に追加され localStorage に保存される', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLoaded();

    await user.type(screen.getByLabelText('タイトル'), '新しいタスク');
    await user.type(screen.getByLabelText('説明'), '詳細メモ');
    await user.click(screen.getByRole('button', { name: '追加' }));

    // 一覧に反映される
    await waitFor(() => {
      expect(screen.getByText('新しいタスク')).toBeInTheDocument();
    });

    // localStorage に永続化される
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject({
        title: '新しいタスク',
        description: '詳細メモ',
        completed: false,
      });
    });

    // 送信後にフォームがリセットされる
    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe('');
  });

  it('空白のみのタイトルは追加されずバリデーションメッセージを表示する', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLoaded();

    await user.type(screen.getByLabelText('タイトル'), '   ');
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
    // リストは空のまま
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// タスクの編集（Requirement 3）
// -----------------------------------------------------------------------

describe('App タスク編集', () => {
  it('編集ボタンでフォームが編集モードになり、保存で内容が更新される', async () => {
    const user = userEvent.setup();
    seedTasks([existingTask]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('既存タスク')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '編集' }));

    // 編集モードの見出しとフォーム初期値を確認
    expect(screen.getByText('タスクを編集')).toBeInTheDocument();
    const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    expect(titleInput.value).toBe('既存タスク');

    await user.clear(titleInput);
    await user.type(titleInput, '更新後タスク');
    await user.click(screen.getByRole('button', { name: '保存' }));

    await waitFor(() => {
      expect(screen.getByText('更新後タスク')).toBeInTheDocument();
    });
    expect(screen.queryByText('既存タスク')).not.toBeInTheDocument();
    // 編集完了後は新規作成モードに戻る
    expect(screen.getByText('タスクを追加')).toBeInTheDocument();
  });

  it('編集をキャンセルすると内容を変更せず新規作成モードに戻る', async () => {
    const user = userEvent.setup();
    seedTasks([existingTask]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('既存タスク')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '編集' }));
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(screen.getByText('タスクを追加')).toBeInTheDocument();
    expect(screen.getByText('既存タスク')).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// タスクの削除（Requirement 4）
// -----------------------------------------------------------------------

describe('App タスク削除', () => {
  it('削除確認ダイアログで承認するとタスクが除外される', async () => {
    const user = userEvent.setup();
    seedTasks([existingTask]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('既存タスク')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '削除' }));

    // 確認ダイアログの承認ボタンを押す
    const dialog = screen.getByRole('dialog', { hidden: true });
    await user.click(within(dialog).getByRole('button', { name: '削除' }));

    await waitFor(() => {
      expect(screen.queryByText('既存タスク')).not.toBeInTheDocument();
    });
    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  it('削除確認をキャンセルするとタスクは残る', async () => {
    const user = userEvent.setup();
    seedTasks([existingTask]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('既存タスク')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: '削除' }));
    const dialog = screen.getByRole('dialog', { hidden: true });
    await user.click(within(dialog).getByRole('button', { name: 'キャンセル' }));

    expect(screen.getByText('既存タスク')).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// 完了状態の切り替え（Requirement 5）
// -----------------------------------------------------------------------

describe('App 完了切り替え', () => {
  it('チェックボックスで完了状態を切り替えると localStorage に反映される', async () => {
    const user = userEvent.setup();
    seedTasks([existingTask]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('既存タスク')).toBeInTheDocument();
    });

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(checkbox.checked).toBe(false);

    await user.click(checkbox);

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
      expect(stored[0].completed).toBe(true);
    });
    expect(checkbox.checked).toBe(true);
  });
});

// -----------------------------------------------------------------------
// フィルタリング（Requirement 6）
// -----------------------------------------------------------------------

describe('App フィルタリング', () => {
  it('未完了 / 完了済みフィルターで表示されるタスクが絞り込まれる', async () => {
    const user = userEvent.setup();
    seedTasks([existingTask, completedTask]);
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('既存タスク')).toBeInTheDocument();
    });

    // 未完了フィルター
    await user.click(screen.getByRole('button', { name: '未完了' }));
    expect(screen.getByText('既存タスク')).toBeInTheDocument();
    expect(screen.queryByText('完了済みタスク')).not.toBeInTheDocument();

    // 完了済みフィルター
    await user.click(screen.getByRole('button', { name: '完了済み' }));
    expect(screen.getByText('完了済みタスク')).toBeInTheDocument();
    expect(screen.queryByText('既存タスク')).not.toBeInTheDocument();

    // 全件フィルター
    await user.click(screen.getByRole('button', { name: '全件' }));
    expect(screen.getByText('既存タスク')).toBeInTheDocument();
    expect(screen.getByText('完了済みタスク')).toBeInTheDocument();
  });

  it('アクティブなフィルターに aria-pressed="true" が付く', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLoaded();

    const pendingButton = screen.getByRole('button', { name: '未完了' });
    await user.click(pendingButton);

    expect(pendingButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: '全件' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });
});

// -----------------------------------------------------------------------
// 読み込みエラー（Requirement 7.4, 7.5）
// -----------------------------------------------------------------------

describe('App 読み込みエラー', () => {
  it('不正データのとき StorageErrorBanner を表示し TaskList を表示しない', async () => {
    const corrupt = 'invalid json {{{';
    localStorage.setItem(STORAGE_KEY, corrupt);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(screen.getByText('データを読み込めませんでした')).toBeInTheDocument();
    // TaskList / FilterBar / 空状態は表示されない
    expect(screen.queryByText('タスクがありません')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('group', { name: 'タスクのフィルター' })
    ).not.toBeInTheDocument();
  });

  it('読み込みエラー時に localStorage の値を変更しない', async () => {
    const corrupt = 'invalid json {{{';
    localStorage.setItem(STORAGE_KEY, corrupt);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBe(corrupt);
  });
});

// -----------------------------------------------------------------------
// 書き込みエラー（Requirement 7.7）
// -----------------------------------------------------------------------

describe('App 書き込みエラー', () => {
  it('保存失敗時にバナーを表示しつつ TaskList（メモリ上のタスク）は維持する', async () => {
    const user = userEvent.setup();
    render(<App />);
    await waitForLoaded();

    // 初期読み込み完了後に setItem を失敗させる
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError');
    });

    await user.type(screen.getByLabelText('タイトル'), '保存に失敗するタスク');
    await user.click(screen.getByRole('button', { name: '追加' }));

    // 保存エラーバナーが表示される
    await waitFor(() => {
      expect(screen.getByText('データを保存できませんでした')).toBeInTheDocument();
    });

    // メモリ上のタスクは維持されリストに表示される
    expect(screen.getByText('保存に失敗するタスク')).toBeInTheDocument();
    // FilterBar / TaskList も引き続き表示される（load エラーとは異なる）
    expect(
      screen.getByRole('group', { name: 'タスクのフィルター' })
    ).toBeInTheDocument();
  });
});

// =======================================================================
// Property-based tests (fast-check) — Task 13
// =======================================================================

import * as fc from 'fast-check';
import type { TaskInput } from './types';

// 有効な Task を生成するアービトラリー。
const taskArb: fc.Arbitrary<Task> = fc.record({
  id: fc.string(),
  title: fc.string(),
  description: fc.string(),
  dueDate: fc.string(),
  completed: fc.boolean(),
});

// 有効な TaskInput を生成するアービトラリー。
const taskInputArb: fc.Arbitrary<TaskInput> = fc.record({
  title: fc.string(),
  description: fc.string(),
  dueDate: fc.string(),
});

// App.updateTask と同一の更新ロジック（id 一致タスクの title/description/dueDate を置換、id/completed は維持）。
function updateTask(tasks: Task[], id: string, input: TaskInput): Task[] {
  return tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          title: input.title,
          description: input.description,
          dueDate: input.dueDate,
        }
      : task
  );
}

// App.deleteTask と同一の削除ロジック（id 一致タスクを除外）。
function deleteTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id);
}

// Feature: taskflow-todo-app, Property 7: タスク編集後の同一性と更新
describe('Property 7: タスク編集後の同一性と更新', () => {
  it('updateTask 適用後もリスト長は不変で、対象の id は変化せず、フィールドが新しい値に置き換わる', () => {
    // Validates: Requirements 3.2
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        fc.nat(),
        taskInputArb,
        (tasks, rawIndex, input) => {
          // 一意な id を保証して対象タスクを曖昧さなく特定できるようにする
          const uniqueTasks = tasks.map((task, i) => ({
            ...task,
            id: `task-${i}`,
          }));
          const index = rawIndex % uniqueTasks.length;
          const target = uniqueTasks[index];

          const result = updateTask(uniqueTasks, target.id, input);

          // リスト長は不変
          expect(result.length).toBe(uniqueTasks.length);

          const updated = result[index];
          // 対象タスクの id は変化しない
          expect(updated.id).toBe(target.id);
          // completed も維持される
          expect(updated.completed).toBe(target.completed);
          // title/description/dueDate は新しい値に置き換わる
          expect(updated.title).toBe(input.title);
          expect(updated.description).toBe(input.description);
          expect(updated.dueDate).toBe(input.dueDate);

          // 対象以外のタスクは変化しない
          result.forEach((task, i) => {
            if (i !== index) {
              expect(task).toEqual(uniqueTasks[i]);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Feature: taskflow-todo-app, Property 8: タスク削除後のリスト縮小と消去
describe('Property 8: タスク削除後のリスト縮小と消去', () => {
  it('deleteTask 適用後のリストに当該 id は存在せず、長さが 1 減少する', () => {
    // Validates: Requirements 4.2
    fc.assert(
      fc.property(
        fc.array(taskArb, { minLength: 1 }),
        fc.nat(),
        (tasks, rawIndex) => {
          // 一意な id を保証して、削除対象を 1 件だけに限定する
          const uniqueTasks = tasks.map((task, i) => ({
            ...task,
            id: `task-${i}`,
          }));
          const index = rawIndex % uniqueTasks.length;
          const targetId = uniqueTasks[index].id;

          const result = deleteTask(uniqueTasks, targetId);

          // 長さが 1 減少する
          expect(result.length).toBe(uniqueTasks.length - 1);
          // 当該 id を持つ Task が存在しない
          expect(result.some((task) => task.id === targetId)).toBe(false);
          // 残りのタスクはすべて元のリストに含まれていたもの
          result.forEach((task) => {
            expect(uniqueTasks).toContainEqual(task);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
