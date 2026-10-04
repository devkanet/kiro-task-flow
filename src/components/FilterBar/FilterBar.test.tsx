import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterBar } from './FilterBar';

// -----------------------------------------------------------------------
// レンダリング
// -----------------------------------------------------------------------

describe('FilterBar レンダリング', () => {
  it('「全件」「未完了」「完了済み」の 3 ボタンを表示する', () => {
    render(<FilterBar current="all" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '全件' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '未完了' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '完了済み' })).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// アクティブ状態の表示（aria-pressed）
// -----------------------------------------------------------------------

describe('FilterBar アクティブ状態', () => {
  it('現在のフィルターのボタンのみ aria-pressed="true" になる', () => {
    render(<FilterBar current="pending" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '未完了' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: '全件' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
    expect(screen.getByRole('button', { name: '完了済み' })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('current が completed のとき完了済みボタンがアクティブになる', () => {
    render(<FilterBar current="completed" onChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: '完了済み' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

// -----------------------------------------------------------------------
// フィルター切り替え
// -----------------------------------------------------------------------

describe('FilterBar 切り替え', () => {
  it('未完了ボタンを押すと onChange が "pending" で呼ばれる', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterBar current="all" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '未完了' }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('pending');
  });

  it('完了済みボタンを押すと onChange が "completed" で呼ばれる', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterBar current="all" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '完了済み' }));

    expect(onChange).toHaveBeenCalledWith('completed');
  });

  it('全件ボタンを押すと onChange が "all" で呼ばれる', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<FilterBar current="pending" onChange={onChange} />);

    await user.click(screen.getByRole('button', { name: '全件' }));

    expect(onChange).toHaveBeenCalledWith('all');
  });
});
