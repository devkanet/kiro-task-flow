import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList } from './TaskList';
import type { Task } from '../../types';

const makeTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  title: 'タスク A',
  description: '',
  dueDate: '',
  completed: false,
  ...overrides,
});

// -----------------------------------------------------------------------
// 空状態（Requirements 2.3）
// -----------------------------------------------------------------------

describe('TaskList 空状態', () => {
  it('タスクが空のとき空状態メッセージを表示する', () => {
    render(
      <TaskList
        tasks={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('タスクがありません')).toBeInTheDocument();
  });

  it('タスクが空のとき TaskItem（listitem）を描画しない', () => {
    render(
      <TaskList
        tasks={[]}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// 一覧レンダリング（Requirements 2.1, 2.3）
// -----------------------------------------------------------------------

describe('TaskList 一覧レンダリング', () => {
  const tasks: Task[] = [
    makeTask({ id: '1', title: 'タスク 1' }),
    makeTask({ id: '2', title: 'タスク 2' }),
    makeTask({ id: '3', title: 'タスク 3', completed: true }),
  ];

  it('渡された全タスクを TaskItem として描画する', () => {
    render(
      <TaskList
        tasks={tasks}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText('タスク 1')).toBeInTheDocument();
    expect(screen.getByText('タスク 2')).toBeInTheDocument();
    expect(screen.getByText('タスク 3')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('タスクが存在するとき空状態メッセージは表示しない', () => {
    render(
      <TaskList
        tasks={tasks}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(screen.queryByText('タスクがありません')).not.toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// コールバックの伝播（対象タスクの id / task を渡す）
// -----------------------------------------------------------------------

describe('TaskList コールバック伝播', () => {
  const tasks: Task[] = [
    makeTask({ id: 'a', title: 'タスク A' }),
    makeTask({ id: 'b', title: 'タスク B' }),
  ];

  it('チェックボックス操作で該当タスクの id を付けて onToggle を呼ぶ', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <TaskList
        tasks={tasks}
        onToggle={onToggle}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: 'タスク B' }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith('b');
  });

  it('編集ボタン操作で該当タスクを付けて onEdit を呼ぶ', async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    render(
      <TaskList
        tasks={tasks}
        onToggle={vi.fn()}
        onEdit={onEdit}
        onDelete={vi.fn()}
      />
    );

    const editButtons = screen.getAllByRole('button', { name: '編集' });
    await user.click(editButtons[0]);

    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onEdit).toHaveBeenCalledWith(tasks[0]);
  });

  it('削除確認の承認で該当タスクの id を付けて onDelete を呼ぶ', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <TaskList
        tasks={tasks}
        onToggle={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />
    );

    const deleteButtons = screen.getAllByRole('button', { name: '削除' });
    await user.click(deleteButtons[1]);

    const dialog = screen.getByRole('dialog', { hidden: true });
    const confirmButton = dialog.querySelector('button');
    await user.click(confirmButton as HTMLButtonElement);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith('b');
  });
});
