import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem } from './TaskItem';
import type { Task } from '../../types';

const baseTask: Task = {
  id: 'task-1',
  title: '買い物に行く',
  description: '',
  dueDate: '',
  completed: false,
};

// -----------------------------------------------------------------------
// 表示（Requirements 2.2）
// -----------------------------------------------------------------------

describe('TaskItem 表示', () => {
  it('タイトルを表示する', () => {
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('買い物に行く')).toBeInTheDocument();
  });

  it('説明が設定されているとき説明を表示する', () => {
    render(
      <TaskItem
        task={{ ...baseTask, description: '牛乳と卵' }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('牛乳と卵')).toBeInTheDocument();
  });

  it('説明が空のときは説明を表示しない', () => {
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText('牛乳と卵')).not.toBeInTheDocument();
  });

  it('期限が設定されているとき期限を表示する', () => {
    render(
      <TaskItem
        task={{ ...baseTask, dueDate: '2025-12-31' }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/2025-12-31/)).toBeInTheDocument();
  });

  it('期限が空のときは期限を表示しない', () => {
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText(/期限:/)).not.toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// 完了状態と ARIA（Requirements 5.1, 5.2, 8.2）
// -----------------------------------------------------------------------

describe('TaskItem 完了状態', () => {
  it('未完了タスクのチェックボックスは未チェック状態である', () => {
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('完了タスクのチェックボックスはチェック状態である', () => {
    render(
      <TaskItem
        task={{ ...baseTask, completed: true }}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('チェックボックスがタイトルによってラベル付けされている', () => {
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(
      screen.getByRole('checkbox', { name: '買い物に行く' })
    ).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// インタラクション（Requirements 5.1, 5.2）
// -----------------------------------------------------------------------

describe('TaskItem インタラクション', () => {
  it('チェックボックスを操作すると onToggle が呼ばれる', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TaskItem
        task={baseTask}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('checkbox'));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('編集ボタンを押すと onEdit が呼ばれる', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: '編集' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});

// -----------------------------------------------------------------------
// 削除と ConfirmDialog（Requirements 4.1）
// -----------------------------------------------------------------------

describe('TaskItem 削除', () => {
  it('削除ボタンを押すまで ConfirmDialog は表示されない', () => {
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });

  it('削除ボタンを押すと ConfirmDialog が表示される', async () => {
    const user = userEvent.setup();
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: '削除' }));

    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toBeInTheDocument();
    // ダイアログ内に削除対象のタスクタイトルが含まれる
    expect(dialog).toHaveTextContent('買い物に行く');
  });

  it('ConfirmDialog で削除を承認すると onDelete が呼ばれダイアログが閉じる', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole('button', { name: '削除' }));
    // ダイアログ内の確認ボタン（「削除」ラベル）を押す
    const dialog = screen.getByRole('dialog', { hidden: true });
    const confirmButton = dialog.querySelector('button');
    await user.click(confirmButton as HTMLButtonElement);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });

  it('ConfirmDialog でキャンセルすると onDelete は呼ばれずダイアログが閉じる', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TaskItem
        task={baseTask}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    await user.click(screen.getByRole('button', { name: '削除' }));
    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { hidden: true })).not.toBeInTheDocument();
  });
});

// =======================================================================
// Property-based tests (fast-check) — Task 13
// =======================================================================

import { cleanup } from '@testing-library/react';
import * as fc from 'fast-check';

// 有効な Task を生成するアービトラリー（completed は true/false 両方）。
const taskArb: fc.Arbitrary<Task> = fc.record({
  id: fc.string(),
  title: fc.string(),
  description: fc.string(),
  dueDate: fc.string(),
  completed: fc.boolean(),
});

// App.toggleTask と同一の切り替えロジック（対象 Task の completed を反転する）。
function toggleTask(task: Task): Task {
  return { ...task, completed: !task.completed };
}

// Feature: taskflow-todo-app, Property 5: 完了切り替えの双方向性
describe('Property 5: 完了切り替えの双方向性', () => {
  test('toggleTask を 2 回適用すると completed は元の値に戻り、1 回適用で反転する', () => {
    // Validates: Requirements 5.1, 5.2
    fc.assert(
      fc.property(taskArb, (task) => {
        // 1 回適用で completed が反転する
        const once = toggleTask(task);
        expect(once.completed).toBe(!task.completed);

        // 2 回適用で元の値に戻る（ラウンドトリップ）
        const twice = toggleTask(once);
        expect(twice.completed).toBe(task.completed);

        // completed 以外のフィールドは変化しない
        expect(once.id).toBe(task.id);
        expect(once.title).toBe(task.title);
        expect(once.description).toBe(task.description);
        expect(once.dueDate).toBe(task.dueDate);
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: taskflow-todo-app, Property 9: TaskItem の ARIA 属性と完了状態の対応
describe('Property 9: TaskItem の ARIA 属性と完了状態の対応', () => {
  test('完了切り替えコントロールの状態が Task の completed フラグと一致する', () => {
    // Validates: Requirements 8.2
    fc.assert(
      fc.property(taskArb, (task) => {
        render(
          <TaskItem
            task={task}
            onToggle={vi.fn()}
            onEdit={vi.fn()}
            onDelete={vi.fn()}
          />
        );

        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        // チェックボックスのチェック状態が completed フラグと一致する
        expect(checkbox.checked).toBe(task.completed);

        cleanup();
      }),
      { numRuns: 100 }
    );
  });
});
