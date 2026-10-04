import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StorageErrorBanner } from './StorageErrorBanner';

// -----------------------------------------------------------------------
// 読み込みエラー（error === 'load'）
// -----------------------------------------------------------------------

describe('StorageErrorBanner 読み込みエラー', () => {
  it('localStorage の修復・クリアと再読み込みを案内するメッセージを表示する', () => {
    render(<StorageErrorBanner error="load" />);

    expect(screen.getByText('データを読み込めませんでした')).toBeInTheDocument();
    expect(screen.getByText(/localStorage/)).toBeInTheDocument();
    expect(screen.getByText(/再読み込み/)).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// 書き込みエラー（error === 'save'）
// -----------------------------------------------------------------------

describe('StorageErrorBanner 書き込みエラー', () => {
  it('再読み込みで未保存の変更が失われる可能性を通知するメッセージを表示する', () => {
    render(<StorageErrorBanner error="save" />);

    expect(screen.getByText('データを保存できませんでした')).toBeInTheDocument();
    expect(screen.getByText(/未保存の変更が失われる/)).toBeInTheDocument();
  });
});

// -----------------------------------------------------------------------
// アクセシビリティ
// -----------------------------------------------------------------------

describe('StorageErrorBanner アクセシビリティ', () => {
  it('読み込みエラー時に role="alert" と aria-live="assertive" を付与する', () => {
    render(<StorageErrorBanner error="load" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('書き込みエラー時に role="alert" と aria-live="assertive" を付与する', () => {
    render(<StorageErrorBanner error="save" />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
});
