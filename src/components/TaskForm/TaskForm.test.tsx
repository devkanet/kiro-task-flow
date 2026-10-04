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

// =======================================================================
// Property-based tests (fast-check) — Task 13
// =======================================================================

import { cleanup, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';

// 空白文字（スペース・タブ・改行など）のみから構成される文字列を生成するアービトラリー。
const whitespaceOnlyArb = fc
  .array(fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\u00a0', '\u3000'), {
    minLength: 1,
    maxLength: 10,
  })
  .map((chars) => chars.join(''));

// Due_Date（YYYY-MM-DD 形式、未設定時は空文字）を生成するアービトラリー。
// <input type="date"> は不正な文字列を受け付けないため、有効な日付文字列または空文字のみを生成する。
const dueDateArb = fc.oneof(
  fc.constant(''),
  fc
    .date({ min: new Date('2000-01-01'), max: new Date('2099-12-31') })
    .map((d) => d.toISOString().slice(0, 10))
);

// 有効な（空白のみでない）タイトルを持つ TaskInput を生成するアービトラリー。
const taskInputArb: fc.Arbitrary<TaskInput> = fc.record({
  title: fc.string().filter((s) => s.trim() !== ''),
  description: fc.string(),
  dueDate: dueDateArb,
});

// Feature: taskflow-todo-app, Property 2: 空白タイトルの追加・編集拒否
describe('Property 2: 空白タイトルの追加・編集拒否', () => {
  it('作成モードで空白のみのタイトルを送信しても onSubmit は呼ばれない（Task_List は変化しない）', () => {
    // Validates: Requirements 1.3, 3.4
    fc.assert(
      fc.property(whitespaceOnlyArb, (blankTitle) => {
        const onSubmit = vi.fn();
        render(<TaskForm onSubmit={onSubmit} />);

        const titleInput = screen.getByLabelText('タイトル');
        fireEvent.change(titleInput, { target: { value: blankTitle } });
        fireEvent.click(screen.getByRole('button', { name: '追加' }));

        // 送信が拒否され、Task_List へ反映されない
        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();

        cleanup();
      }),
      { numRuns: 100 }
    );
  });

  it('編集モードで空白のみのタイトルに変更して保存しても onSubmit は呼ばれない（Task_List は変化しない）', () => {
    // Validates: Requirements 1.3, 3.4
    const initialValues: TaskInput = {
      title: '既存タスク',
      description: '既存の説明',
      dueDate: '2025-06-01',
    };

    fc.assert(
      fc.property(whitespaceOnlyArb, (blankTitle) => {
        const onSubmit = vi.fn();
        render(<TaskForm initialValues={initialValues} onSubmit={onSubmit} />);

        const titleInput = screen.getByLabelText('タイトル');
        fireEvent.change(titleInput, { target: { value: blankTitle } });
        fireEvent.click(screen.getByRole('button', { name: '保存' }));

        expect(onSubmit).not.toHaveBeenCalled();
        expect(screen.getByText('タイトルは必須です')).toBeInTheDocument();

        cleanup();
      }),
      { numRuns: 100 }
    );
  });
});

// Feature: taskflow-todo-app, Property 3: タスク操作後のフォームリセット
describe('Property 3: タスク操作後のフォームリセット', () => {
  it('作成モードで有効な TaskInput を送信した後、全フィールドが空の初期値にリセットされる', () => {
    // Validates: Requirements 1.4
    fc.assert(
      fc.property(taskInputArb, (input) => {
        const onSubmit = vi.fn();
        render(<TaskForm onSubmit={onSubmit} />);

        const titleInput = screen.getByLabelText('タイトル') as HTMLInputElement;
        const descriptionInput = screen.getByLabelText(
          '説明'
        ) as HTMLTextAreaElement;
        const dueDateInput = screen.getByLabelText('期限') as HTMLInputElement;

        fireEvent.change(titleInput, { target: { value: input.title } });
        fireEvent.change(descriptionInput, {
          target: { value: input.description },
        });
        fireEvent.change(dueDateInput, { target: { value: input.dueDate } });
        fireEvent.click(screen.getByRole('button', { name: '追加' }));

        // onSubmit は入力値で呼ばれる
        expect(onSubmit).toHaveBeenCalledWith<[TaskInput]>(input);
        // 送信後、全フィールドが空の初期値にリセットされる
        expect(titleInput.value).toBe('');
        expect(descriptionInput.value).toBe('');
        expect(dueDateInput.value).toBe('');

        cleanup();
      }),
      { numRuns: 100 }
    );
  });
});
