import styles from './StorageErrorBanner.module.css';

interface StorageErrorBannerProps {
  error: 'load' | 'save';
}

const MESSAGES: Record<StorageErrorBannerProps['error'], { heading: string; body: string }> = {
  load: {
    heading: 'データを読み込めませんでした',
    body: '保存されているデータが壊れている可能性があります。ブラウザの開発者ツールで localStorage を修復またはクリアし、ページを再読み込みしてください。詳細はコンソールを確認してください。',
  },
  save: {
    heading: 'データを保存できませんでした',
    body: '変更はこの画面には反映されていますが、保存に失敗しました。ページを再読み込みすると未保存の変更が失われる可能性があります。詳細はコンソールを確認してください。',
  },
};

/**
 * ストレージの読み込み・書き込みエラーを通知するバナー。
 * role="alert" と aria-live="assertive" により、スクリーンリーダーが
 * エラー発生を即座に読み上げる。
 */
export function StorageErrorBanner({ error }: StorageErrorBannerProps) {
  const { heading, body } = MESSAGES[error];

  return (
    <div className={styles.banner} role="alert" aria-live="assertive">
      <p className={styles.heading}>{heading}</p>
      <p className={styles.message}>{body}</p>
    </div>
  );
}
