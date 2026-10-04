import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';
import type { TaskInput } from '../../types';

// -----------------------------------------------------------------------
// 新規作成モード（initialValues 未指定）
// -----------------------------------------------------------------------

describe('TaskForm 新規作成モード', () => {
  it('有効な入力を送信すると onSubmit が入力値で呼ばれる', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('タイトル'), '買い物に行く');
    await user.type(screen.getByLabelText('説明'), '牛乳と卵');
    await user.type(screen.getByLabelText('期限'), '2025-12-31');
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith<[TaskInput]>({
      title: '買い物に行く',
      description: '牛乳と卵',
      dueDate: '2025-12-31',
    });
  });

  it('送信完了後に全フィールドが空の初期状態にリセットされる', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
    const descriptionInput = screen.getByLabelText('説明') as HTMLTextAreaElement;
    const dueDateInput = screen.getByLabelText('期限') as HTMLInputElement;

    await user.type(titleInput, 'タスク A');
    await user.type(descriptionInput, '説明文');
    await user.type(dueDateInput, '2025-01-01');
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(titleInput.value).toBe('');
    expect(descriptionInput.value).toBe('');
    expect(dueDateInput.value).toBe('');
  });

  it('新規作成モードではキャンセルボタンを表示しない', () => {
    render(<TaskForm onSubmit={vi.fn()} />);
    expect(
      screen.queryByRole('button', { name: 'キャンセル' })
    ).not.toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// バリデーション
// -----------------------------------------------------------------------

describe('TaskForm バリデーション', () => {
  it('タイトルが空のまま送信すると onSubmit が呼ばれずメッセージを表示する', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
  });

  it('タイトルが空白のみの場合は送信を拒否する', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText('タイトル'), '   ');
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
  });

  it('バリデーションメッセージがタイトルフィールドと aria-describedby で紐付く', async () => {
    const user = userEvent.setup();
    render(<TaskForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '追加' }));

    const titleInput = screen.getByLabelText('タイトル');
    const message = screen.getByText('タイトルは必須です');
    const describedBy = titleInput.getAttribute('aria-describedby');

    expect(describedBy).toBeTruthy();
    expect(message.id).toBe(describedBy);
    expect(titleInput).toHaveAttribute('aria-invalid', 'true');
  });
});

// -----------------------------------------------------------------------
// 編集モード（initialValues 指定）
// -----------------------------------------------------------------------

describe('TaskForm 編集モード', () => {
  const initialValues: TaskInput = {
    title: '既存タスク',
    description: '既存の説明',
    dueDate: '2025-06-01',
  };

  it('initialValues がフォームに表示される', () => {
    render(<TaskForm initialValues={initialValues} onSubmit={vi.fn()} />);

    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe(
      '既存タスク'
    );
    expect((screen.getByLabelText('説明') as HTMLTextAreaElement).value).toBe(
      '既存の説明'
    );
    expect((screen.getByLabelText('期限') as HTMLInputElement).value).toBe(
      '2025-06-01'
    );
  });

  it('編集内容を送信すると onSubmit が更新後の値で呼ばれる', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm initialValues={initialValues} onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText('タイトル');
    await user.clear(titleInput);
    await user.type(titleInput, '更新後タスク');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(onSubmit).toHaveBeenCalledWith<[TaskInput]>({
      title: '更新後タスク',
      description: '既存の説明',
      dueDate: '2025-06-01',
    });
  });

  it('編集モードでは送信後にフィールドをリセットしない', async () => {
    const user = userEvent.setup();
    render(<TaskForm initialValues={initialValues} onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: '保存' }));

    expect((screen.getByLabelText('タイトル') as HTMLInputElement).value).toBe(
      '既存タスク'
    );
  });

  it('キャンセルボタンを押すと onCancel が呼ばれる', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <TaskForm
        initialValues={initialValues}
        onSubmit={vi.fn()}
        onCancel={onCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: 'キャンセル' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('編集モードで空白のみのタイトルは保存を拒否する', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<TaskForm initialValues={initialValues} onSubmit={onSubmit} />);

    const titleInput = screen.getByLabelText('タイトル');
    await user.clear(titleInput);
    await user.type(titleInput, '   ');
    await user.click(screen.getByRole('button', { name: '保存' }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();
  });
});
