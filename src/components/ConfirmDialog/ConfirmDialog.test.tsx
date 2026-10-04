import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmDialog } from './ConfirmDialog';

// -----------------------------------------------------------------------
// 表示
// -----------------------------------------------------------------------

describe('ConfirmDialog 表示', () => {
  it('削除対象のタスクタイトルを表示する', () => {
    render(
      <ConfirmDialog
        taskTitle="買い物に行く"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText(/買い物に行く/)).toBeInTheDocument();
  });

  it('ダイアログとして開かれ、承認・キャンセルボタンを表示する', () => {
    render(
      <ConfirmDialog taskTitle="タスク A" onConfirm={vi.fn()} onCancel={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: '削除' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'キャンセル' })
    ).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// インタラクション
// -----------------------------------------------------------------------

describe('ConfirmDialog インタラクション', () => {
  it('削除ボタンを押すと onConfirm が呼ばれる', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        taskTitle="タスク A"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: '削除' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('キャンセルボタンを押すと onCancel が呼ばれる', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        taskTitle="タスク A"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('ESC キー相当の cancel イベントで onCancel が呼ばれる', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        taskTitle="タスク A"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    // ネイティブ <dialog> は ESC キーで cancel イベントを発火する
    const dialog = screen.getByRole('dialog', { hidden: true });
    fireEvent(dialog, new Event('cancel', { cancelable: true }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
