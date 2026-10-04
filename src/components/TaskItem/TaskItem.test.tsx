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
